import { getReadContract } from '../config/blockchain.js';
import { createError }     from '../middleware/errorHandler.js';

const gateway = () => process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

function fmtEv(ev) {
  return {
    evidenceId:  ev.evidenceId,
    sha256Hash:  ev.sha256Hash,
    ipfsCid:     ev.ipfsCid,
    ipfsUrl:     `${gateway()}/${ev.ipfsCid}`,
    caseId:      ev.caseId,
    description: ev.description,
    submittedBy: ev.submittedBy,
    timestamp:   Number(ev.timestamp),
    date:        new Date(Number(ev.timestamp) * 1000).toISOString(),
  };
}

// ─── GET /api/cases/:caseId ───────────────────────────────────────────────────
/**
 * Returns all evidence records linked to the given caseId.
 */
export async function getCaseEvidence(req, res, next) {
  try {
    const { caseId } = req.params;
    const contract   = getReadContract();
    const ids        = await contract.getEvidenceByCase(caseId);

    const records = await Promise.all(
      ids.map(id => contract.getEvidence(id).then(fmtEv))
    );

    res.json({
      success: true,
      data: {
        caseId,
        totalEvidence: records.length,
        records,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/cases/:caseId/summary ──────────────────────────────────────────
/**
 * Lightweight summary — just the count and list of IDs.
 */
export async function getCaseSummary(req, res, next) {
  try {
    const { caseId } = req.params;
    const contract   = getReadContract();
    const ids        = await contract.getEvidenceByCase(caseId);

    res.json({
      success: true,
      data: {
        caseId,
        evidenceCount: ids.length,
        evidenceIds:   ids,
      },
    });
  } catch (err) {
    next(err);
  }
}
