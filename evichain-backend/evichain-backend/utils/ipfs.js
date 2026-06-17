import { createHash } from 'crypto';
import fetch from 'node-fetch';
import FormData from 'form-data';

const PINATA_BASE    = 'https://api.pinata.cloud';
const PINATA_GATEWAY = () => process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

function pinataHeaders() {
  return {
    pinata_api_key:           process.env.PINATA_API_KEY    || '',
    pinata_secret_api_key:    process.env.PINATA_SECRET_KEY || '',
  };
}

// ─── SHA-256 ─────────────────────────────────────────────────────────────────

/**
 * Compute SHA-256 of a buffer.
 * Returns a lowercase 64-character hex string.
 * @param {Buffer} buffer
 * @returns {string}
 */
export function computeSHA256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

// ─── IPFS Upload ─────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to IPFS via Pinata.
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @param {object} metadata  Extra key-values stored in Pinata metadata
 * @returns {Promise<{ cid: string, url: string }>}
 */
export async function uploadToIPFS(fileBuffer, fileName, metadata = {}) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename: fileName });

  form.append('pinataMetadata', JSON.stringify({
    name: fileName,
    keyvalues: metadata,
  }));

  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const res = await fetch(`${PINATA_BASE}/pinning/pinFileToIPFS`, {
    method:  'POST',
    headers: { ...pinataHeaders(), ...form.getHeaders() },
    body:    form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Pinata upload failed ${res.status}: ${txt}`);
  }

  const { IpfsHash: cid } = await res.json();
  return { cid, url: `${PINATA_GATEWAY()}/${cid}` };
}

// ─── IPFS Fetch ──────────────────────────────────────────────────────────────

/**
 * Download a file from IPFS via the Pinata gateway.
 * @param {string} cid
 * @returns {Promise<Buffer>}
 */
export async function fetchFromIPFS(cid) {
  const res = await fetch(`${PINATA_GATEWAY()}/${cid}`);
  if (!res.ok) throw new Error(`IPFS fetch failed ${res.status} for CID: ${cid}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Integrity Check ─────────────────────────────────────────────────────────

/**
 * Re-download from IPFS and verify its SHA-256 matches the expected hash.
 * @param {string} cid
 * @param {string} expectedHash  Lowercase hex string
 * @returns {Promise<boolean>}
 */
export async function verifyIPFSIntegrity(cid, expectedHash) {
  try {
    const buf  = await fetchFromIPFS(cid);
    const hash = computeSHA256(buf);
    return hash === expectedHash.toLowerCase();
  } catch {
    return false;
  }
}

// ─── Evidence ID Generator ───────────────────────────────────────────────────

/**
 * Generate a unique, human-readable evidence ID.
 * Format: EV-YYYY-NNNN  (e.g. EV-2025-0001)
 * @param {number} currentTotal  Total evidence count before this submission
 * @returns {string}
 */
export function generateEvidenceId(currentTotal) {
  const year = new Date().getFullYear();
  const seq  = String(currentTotal + 1).padStart(4, '0');
  return `EV-${year}-${seq}`;
}
