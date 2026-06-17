import { getWriteContract, getReadContract } from '../config/blockchain.js';
import { getFirestoreInstance } from '../config/firebase.js';
import { saveEvidenceRecord } from '../database/evidenceStore.js';
import { uploadToIPFS, computeSHA256, generateEvidenceId } from '../utils/ipfs.js';
import { createError } from '../middleware/errorHandler.js';

const FIREBASE_EVIDENCE_COLLECTION = process.env.FIREBASE_EVIDENCE_COLLECTION || 'evidence_metadata';

async function findEvidenceByHash(sha256Hash) {
  const db = getFirestoreInstance();
  if (!db) return null;
  const snapshot = await db.collection(FIREBASE_EVIDENCE_COLLECTION)
    .where('sha256Hash', '==', sha256Hash)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

// ─── Helper: infer evidence type from filename ───────────────────────────────
function inferEvidenceType(fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const extMap = {
    pdf: 'DOC',
    doc: 'DOC',
    docx: 'DOC',
    txt: 'LOG',
    log: 'LOG',
    csv: 'LOG',
    json: 'LOG',
    jpg: 'IMG',
    jpeg: 'IMG',
    png: 'IMG',
    gif: 'IMG',
    webp: 'IMG',
    mp4: 'VID',
    mov: 'VID',
    pcap: 'LOG',
    zip: 'ARCH',
    rar: 'ARCH',
    '7z': 'ARCH',
    tar: 'ARCH',
    gz: 'ARCH',
    tgz: 'ARCH',
  };
  return extMap[ext] || 'DOC';
}

function resolveEvidenceType(evidenceType = '', fileName = '', mimeType = '') {
  const provided = String(evidenceType || '').trim();
  const mime = String(mimeType || '').toLowerCase();

  // Prefer MIME type when available
  if (mime.startsWith('image/')) return 'IMG';
  if (mime.startsWith('video/')) return 'VID';
  if (mime.includes('text/') || mime.includes('json') || mime.includes('csv') || mime.includes('log')) return 'LOG';

  // Next, infer from filename extension
  const inferred = inferEvidenceType(fileName);
  if (inferred) return inferred;

  // Finally, fall back to provided form value when meaningful
  const normalized = provided.toUpperCase();
  if (normalized === 'IMG' || normalized === 'LOG' || normalized === 'DOC' || normalized === 'VID' || normalized === 'ARCH') return normalized;
  if (normalized.includes('IMAGE') || normalized.includes('PHOTO') || normalized.includes('PICTURE')) return 'IMG';
  if (normalized.includes('VIDEO')) return 'VID';
  if (normalized.includes('LOG')) return 'LOG';
  if (normalized.includes('DOC') || normalized.includes('REPORT') || normalized.includes('FORM') || normalized.includes('DOCUMENT')) return 'DOC';

  return 'DOC';
}

// ─── Helper: format a contract Evidence struct for the API response ───────────
function formatEvidence(ev, metadata = null) {
  const gateway = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
  return {
    evidenceId:  ev.evidenceId,
    sha256Hash:  ev.sha256Hash,
    ipfsCid:     ev.ipfsCid,
    ipfsUrl:     `${gateway}/${ev.ipfsCid}`,
    caseId:      ev.caseId,
    description: ev.description,
    submittedBy: ev.submittedBy,
    timestamp:   Number(ev.timestamp),
    date:        new Date(Number(ev.timestamp) * 1000).toISOString(),
    fileName:    metadata?.fileName || null,
    mimeType:    metadata?.mimeType || null,
    evidenceType: metadata?.evidenceType || null,
    txHash:      metadata?.txHash || null,
    blockNumber: metadata?.blockNumber || null,
  };
}

// ─── POST /api/evidence/submit ────────────────────────────────────────────────
/**
 * Upload a file to IPFS, compute its SHA-256, and anchor the metadata
 * permanently on the Ethereum blockchain via the EviChain smart contract.
 *
 * Multipart body fields:
 *   file        (required) — the evidence file
 *   caseId      (required) — case reference string
 *   description (optional) — free-text description
 */
export async function submitEvidence(req, res, next) {
  try {
    if (!req.file)    throw createError('No file was uploaded', 400);
    if (!req.body.caseId) throw createError('caseId is required', 400);

    const { caseId, description = '', evidenceType = '' } = req.body;
    const submitter = req.user?.walletAddress || req.user?.id || 'unknown';

    // ── Step 1: Compute SHA-256 fingerprint ──────────────────────────────────
    const sha256Hash = computeSHA256(req.file.buffer);
    console.log(`[EviChain] SHA-256: ${sha256Hash}`);

    const reuseExisting = String(req.body.reuseExisting || '').toLowerCase() === 'true';
    const existingCid = (req.body.existingCid || '').trim();

    // ── Step 2: Upload file to IPFS via Pinata ───────────────────────────────
    let cid;
    let url;
    if (reuseExisting) {
      if (!existingCid) {
        throw createError('existingCid is required when reusing an existing IPFS asset', 400);
      }
      console.log('[EviChain] Reusing existing IPFS CID from duplicate detection');
      const existing = await findEvidenceByHash(sha256Hash);
      if (!existing || existing.ipfsCid !== existingCid) {
        throw createError('Existing CID does not match computed evidence hash', 400);
      }
      cid = existingCid;
      url = `${process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs'}/${cid}`;
    } else {
      console.log(`[EviChain] Uploading to IPFS...`);
      const upload = await uploadToIPFS(
        req.file.buffer,
        req.file.originalname,
        { caseId, submittedBy: submitter }
      );
      cid = upload.cid;
      url = upload.url;
      console.log(`[EviChain] IPFS CID: ${cid}`);
    }

    // ── Step 3: Generate a unique evidence ID ────────────────────────────────
    const readContract = getReadContract();
    const total        = await readContract.getTotalEvidence();
    const evidenceId   = generateEvidenceId(Number(total));

    // ── Step 4: Anchor on blockchain ─────────────────────────────────────────
    console.log(`[EviChain] Submitting to blockchain (evidenceId: ${evidenceId})...`);
    const writeContract = getWriteContract();
    const tx            = await writeContract.submitEvidence(
      evidenceId,
      sha256Hash,
      cid,
      caseId,
      description
    );
    const receipt = await tx.wait();
    console.log(`[EviChain] TX confirmed: ${receipt.hash}`);

    const resolvedEvidenceType = resolveEvidenceType(evidenceType, req.file.originalname, req.file.mimetype);

    const firebaseResult = await saveEvidenceRecord({
      evidenceId,
      sha256Hash,
      ipfsCid: cid,
      ipfsUrl: url,
      caseId,
      description,
      submittedBy: submitter,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      evidenceType: resolvedEvidenceType,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: Math.floor(Date.now() / 1000),
      date: new Date().toISOString(),
      network: 'sepolia',
    });

    if (!firebaseResult.saved) {
      console.warn(`[EviChain] Firebase metadata not saved: ${firebaseResult.reason}`);
    }

    // ── Response ─────────────────────────────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Evidence submitted and anchored on blockchain successfully',
      data: {
        evidenceId,
        sha256Hash,
        ipfsCid:     cid,
        ipfsUrl:     url,
        caseId,
        description,
        submittedBy: submitter,
        fileName:    req.file.originalname,
        fileSize:    req.file.size,
        mimeType:    req.file.mimetype,
        evidenceType: resolvedEvidenceType,
        txHash:      receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp:   Math.floor(Date.now() / 1000),
        date:        new Date().toISOString(),
        firebase:    firebaseResult,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/evidence/duplicate ─────────────────────────────────────────────
export async function checkDuplicateEvidence(req, res, next) {
  try {
    const { sha256Hash } = req.body;
    if (!sha256Hash) {
      throw createError('sha256Hash is required', 400);
    }

    const existing = await findEvidenceByHash(sha256Hash);
    if (!existing) {
      return res.json({ success: true, exists: false });
    }

    return res.json({
      success: true,
      exists: true,
      data: {
        evidenceId: existing.evidenceId,
        ipfsCid: existing.ipfsCid,
        ipfsUrl: existing.ipfsUrl,
        caseId: existing.caseId,
        description: existing.description,
        txHash: existing.txHash,
        blockNumber: existing.blockNumber,
        date: existing.date,
        network: existing.network,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/evidence ────────────────────────────────────────────────────────
/**
 * Paginated list of all evidence records.
 * Query params: ?offset=0&limit=20
 */
export async function getAllEvidence(req, res, next) {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100);

    const contract = getReadContract();
    const total    = await contract.getTotalEvidence();
    const ids      = await contract.getAllEvidenceIds(offset, limit);

    const db = getFirestoreInstance();
    const records = await Promise.all(ids.map(async (id) => {
      const ev = await contract.getEvidence(id);
      let metadata = null;

      if (db) {
        const doc = await db.collection(FIREBASE_EVIDENCE_COLLECTION).doc(id).get();
        metadata = doc.exists ? doc.data() : null;
      }

      return formatEvidence(ev, metadata);
    }));

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total:   Number(total),
          offset,
          limit,
          hasMore: offset + limit < Number(total),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/evidence/case/:caseId ──────────────────────────────────────────
/**
 * All evidence linked to a specific case.
 */
export async function getEvidenceByCase(req, res, next) {
  try {
    const { caseId } = req.params;
    const contract   = getReadContract();
    const ids        = await contract.getEvidenceByCase(caseId);

    const records = await Promise.all(ids.map(id => contract.getEvidence(id).then(formatEvidence)));

    res.json({
      success: true,
      data: { caseId, count: records.length, records },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/evidence/:evidenceId ───────────────────────────────────────────
/**
 * Fetch a single evidence record by its ID.
 * Also logs an on-chain ACCESS event for chain-of-custody.
 */
export async function getEvidence(req, res, next) {
  try {
    const { evidenceId } = req.params;
    const readContract   = getReadContract();

    const exists = await readContract.evidenceExists(evidenceId);
    if (!exists) throw createError(`Evidence '${evidenceId}' not found`, 404);

    const ev = await readContract.getEvidence(evidenceId);

    // Log access event on-chain
    try {
      const writeContract = getWriteContract();
      const tx = await writeContract.logCustodyEvent(
        evidenceId,
        'ACCESSED',
        `Read by ${req.user?.walletAddress || 'unknown'} via API`
      );
      await tx.wait();
    } catch (logErr) {
      // Non-fatal — don't fail the read if logging fails
      console.warn('[EviChain] Could not log custody event:', logErr.message);
    }

    res.json({ success: true, data: formatEvidence(ev) });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/evidence/:evidenceId/custody ───────────────────────────────────
/**
 * Full chain-of-custody log for a piece of evidence.
 */
export async function getCustodyLog(req, res, next) {
  try {
    const { evidenceId } = req.params;
    const contract       = getReadContract();

    const exists = await contract.evidenceExists(evidenceId);
    if (!exists) throw createError(`Evidence '${evidenceId}' not found`, 404);

    const log = await contract.getCustodyLog(evidenceId);

    res.json({
      success: true,
      data: {
        evidenceId,
        entries: log.map(e => ({
          actor:     e.actor,
          action:    e.action,
          notes:     e.notes,
          timestamp: Number(e.timestamp),
          date:      new Date(Number(e.timestamp) * 1000).toISOString(),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/evidence/:evidenceId/metadata ─────────────────────────────────
/**
 * Return stored Firebase metadata for the given evidenceId (includes txHash, fileName, etc.)
 */
export async function getEvidenceMetadata(req, res, next) {
  try {
    const { evidenceId } = req.params;
    const db = getFirestoreInstance();
    if (!db) throw createError('Firebase is not configured', 500);

    const doc = await db.collection(FIREBASE_EVIDENCE_COLLECTION).doc(evidenceId).get();
    if (!doc.exists) {
      return res.json({ success: true, data: null });
    }

    const data = doc.data();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
