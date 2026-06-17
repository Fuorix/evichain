import { getReadContract } from '../config/blockchain.js';
import { computeSHA256, verifyIPFSIntegrity } from '../utils/ipfs.js';
import { createError } from '../middleware/errorHandler.js';

// ─── POST /api/verify/hash ────────────────────────────────────────────────────
/**
 * Quick chain-only verification.
 * The investigator provides an evidenceId + sha256Hash and we check it
 * against the on-chain record — no file re-upload required.
 *
 * Body: { evidenceId, sha256Hash }
 */
export async function verifyByHash(req, res, next) {
  try {
    const { evidenceId, sha256Hash } = req.body;
    if (!evidenceId || !sha256Hash) {
      throw createError('Both evidenceId and sha256Hash are required', 400);
    }

    const contract = getReadContract();

    // verifyEvidence returns (isValid, ipfsCid, timestamp)
    const [isValid, ipfsCid, timestamp] = await contract.verifyEvidence(
      evidenceId,
      sha256Hash.toLowerCase()
    );

    res.json({
      success: true,
      data: {
        evidenceId,
        providedHash: sha256Hash.toLowerCase(),
        isValid,
        ipfsCid:   isValid ? ipfsCid   : null,
        timestamp: isValid ? Number(timestamp) : null,
        date:      isValid ? new Date(Number(timestamp) * 1000).toISOString() : null,
        message:   isValid
          ? '✅ Integrity verified — hash matches the on-chain record.'
          : '❌ Integrity check FAILED — hash does not match the on-chain record. Evidence may have been tampered with.',
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/verify/file ────────────────────────────────────────────────────
/**
 * Full dual-layer verification:
 *   1. Re-compute SHA-256 of the uploaded file
 *   2. Compare against the blockchain record
 *   3. Re-fetch the file from IPFS and re-hash it to confirm IPFS copy intact
 *
 * Multipart body fields:
 *   file       (required) — the file to verify
 *   evidenceId (required) — the evidence ID to check against
 */
export async function verifyByFile(req, res, next) {
  try {
    if (!req.file)         throw createError('No file uploaded', 400);
    if (!req.body.evidenceId) throw createError('evidenceId is required', 400);

    const { evidenceId } = req.body;

    // ── Step 1: Hash the uploaded file ───────────────────────────────────────
    const computedHash = computeSHA256(req.file.buffer);

    // ── Step 2: Verify against blockchain ────────────────────────────────────
    const contract = getReadContract();
    const [chainVerified, ipfsCid, timestamp] = await contract.verifyEvidence(
      evidenceId,
      computedHash
    );

    // ── Step 3: Verify IPFS copy (only if chain check passed) ────────────────
    let ipfsVerified = null;
    if (chainVerified && ipfsCid) {
      ipfsVerified = await verifyIPFSIntegrity(ipfsCid, computedHash);
    }

    const fullyIntact = chainVerified && ipfsVerified === true;

    res.json({
      success: true,
      data: {
        evidenceId,
        fileName:      req.file.originalname,
        fileSize:      req.file.size,
        computedHash,
        chainVerified,
        ipfsVerified,
        ipfsCid:       chainVerified ? ipfsCid : null,
        timestamp:     chainVerified ? Number(timestamp) : null,
        date:          chainVerified ? new Date(Number(timestamp) * 1000).toISOString() : null,
        fullyIntact,
        message:       buildVerifyMessage(chainVerified, ipfsVerified),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function buildVerifyMessage(chainOk, ipfsOk) {
  if (!chainOk) {
    return '❌ TAMPERED — File hash does not match the blockchain record. This evidence may have been modified.';
  }
  if (ipfsOk === false) {
    return '⚠️  Chain hash matches but IPFS copy differs. Possible corruption or propagation issue.';
  }
  if (ipfsOk === true) {
    return '✅ FULLY INTACT — Evidence verified on both blockchain and IPFS. No tampering detected.';
  }
  return '✅ Chain record verified. IPFS cross-check could not be performed.';
}
