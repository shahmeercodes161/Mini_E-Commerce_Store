import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless environment, the filesystem is read-only except /tmp
const uploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists safely
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('Notice ensuring uploads directory:', err.message);
}

// Check if Cloudinary is configured via environment variables
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary configured successfully for image uploads.');
} else {
  console.log('💻 Storing product images locally on PC in Backened/uploads/ via Multer.');
}

// 1. Multer Disk Storage Configuration (Stores on user's own PC)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

// 2. File Filter (Accept images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg\+xml/;
  const isMimeValid = allowedTypes.test(file.mimetype);
  const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase().replace('.', ''));

  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit
  fileFilter: fileFilter
});

// 3. Helper to determine URL: Cloudinary or Local PC static path
export const processUploadedImage = async (file, req) => {
  if (!file) return '';

  // 1. If Cloudinary credentials exist, upload to Cloudinary CDN
  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'doorstep_products',
        resource_type: 'image'
      });
      try { fs.unlinkSync(file.path); } catch { /* ignore */ }
      return result.secure_url;
    } catch (cloudError) {
      console.warn('⚠️ Cloudinary upload error, falling back:', cloudError.message);
    }
  }

  // 2. On Vercel serverless environment: Convert to permanent Base64 Data URL.
  // Vercel's /tmp filesystem is wiped whenever a serverless lambda sleeps or recycles.
  // Storing the image directly as a Base64 string in MongoDB ensures it NEVER breaks or 404s!
  if (process.env.VERCEL) {
    try {
      if (fs.existsSync(file.path)) {
        const fileBuffer = fs.readFileSync(file.path);
        const mimeType = file.mimetype || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        try { fs.unlinkSync(file.path); } catch {}
        return base64Data;
      }
    } catch (err) {
      console.warn('Notice converting uploaded image to base64 on Vercel:', err.message);
    }
  }

  // 3. Fallback for standalone local node development
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${protocol}://${host}/uploads/${file.filename}`;
};
