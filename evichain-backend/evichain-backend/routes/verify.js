import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload }        from '../middleware/upload.js';
import { verifyByHash, verifyByFile } from '../controllers/verifyController.js';

const router = Router();

router.use(authenticate);

router.post('/hash', verifyByHash);                        // POST /api/verify/hash
router.post('/file', upload.single('file'), verifyByFile); // POST /api/verify/file

export default router;
