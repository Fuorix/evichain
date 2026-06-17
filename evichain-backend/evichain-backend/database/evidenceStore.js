import { getFirestoreInstance, getFirebaseStatus } from '../config/firebase.js';

const COLLECTION = process.env.FIREBASE_EVIDENCE_COLLECTION || 'evidence_metadata';

export async function saveEvidenceRecord({
  evidenceId,
  sha256Hash,
  ipfsCid,
  ipfsUrl,
  caseId,
  description,
  submittedBy,
  fileName,
  fileSize,
  mimeType,
  txHash,
  blockNumber,
  timestamp,
  date,
  network,
  evidenceType,
} = {}) {
  const db = getFirestoreInstance();
  if (!db) {
    return { configured: false, saved: false, reason: 'Firebase is not configured' };
  }

  const payload = {
    evidenceId: evidenceId || null,
    sha256Hash: sha256Hash || null,
    ipfsCid: ipfsCid || null,
    ipfsUrl: ipfsUrl || null,
    caseId: caseId || null,
    description: description || null,
    submittedBy: (submittedBy || '').toLowerCase(),
    fileName: fileName || null,
    fileSize: fileSize || 0,
    mimeType: mimeType || null,
    evidenceType: evidenceType || null,
    txHash: txHash || null,
    blockNumber: blockNumber || null,
    timestamp: timestamp || Math.floor(Date.now() / 1000),
    date: date || new Date().toISOString(),
    network: network || 'sepolia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.collection(COLLECTION).doc(evidenceId).set(payload, { merge: true });
    return {
      configured: true,
      saved: true,
      collectionName: COLLECTION,
    };
  } catch (error) {
    return {
      configured: true,
      saved: false,
      collectionName: COLLECTION,
      reason: `Firebase write failed: ${error.message}`,
    };
  }
}

export function evidenceStatus() {
  return getFirebaseStatus();
}
