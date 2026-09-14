import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

const imageFilter = (_req, file, cb) =>
  /image\/(png|jpe?g|webp|gif)/.test(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Solo se permiten imágenes (png, jpg, webp, gif)'));

const excelFilter = (_req, file, cb) =>
  /\.(xlsx|xls)$/i.test(file.originalname) || /(spreadsheet|excel|octet-stream)/.test(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Solo se permiten archivos Excel (.xlsx / .xls)'));

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: excelFilter,
});

export { uploadsDir };