import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { upload }       from '../middleware/upload.js';
import {
  submitEvidence,
  checkDuplicateEvidence,
  getAllEvidence,
  getEvidenceByCase,
  getEvidence,
  getEvidenceMetadata,
  getCustodyLog,
} from '../controllers/evidenceController.js';

const router = Router();

// All evidence routes require a valid JWT
router.use(authenticate);

router.post('/duplicate',     checkDuplicateEvidence);
router.post('/',              requireRoles('police_officer', 'forensic_officer'), upload.single('file'), submitEvidence); // handled by /submit below
router.post('/submit',        requireRoles('police_officer', 'forensic_officer'), upload.single('file'), submitEvidence);
router.get('/',               getAllEvidence);
router.get('/case/:caseId',   getEvidenceByCase);
router.get('/:evidenceId',    getEvidence);
router.get('/:evidenceId/metadata', getEvidenceMetadata);
router.get('/:evidenceId/custody', getCustodyLog);

export default router;
