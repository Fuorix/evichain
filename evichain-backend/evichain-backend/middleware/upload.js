import multer from 'multer';

// Store in memory — we hash the buffer then pipe it to IPFS.
// No files ever hit the local disk.
const storage = multer.memoryStorage();

const ALLOWED = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
];

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter(_req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});
