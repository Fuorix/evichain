import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCaseEvidence, getCaseSummary } from '../controllers/casesController.js';

const router = Router();

router.use(authenticate);

router.get('/:caseId',         getCaseEvidence);  // GET /api/cases/:caseId
router.get('/:caseId/summary', getCaseSummary);   // GET /api/cases/:caseId/summary

export default router;
