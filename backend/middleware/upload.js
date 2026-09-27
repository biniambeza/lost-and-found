const { randomUUID } = require('node:crypto');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lost-and-found/items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: () => randomUUID(),
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(Object.assign(new Error('Upload a JPEG, PNG, or WebP image.'), { statusCode: 400 }));
      return;
    }
    callback(null, true);
  },
});

function uploadItemPhoto(request, response, next) {
  if (!request.is('multipart/form-data')) return next();
  const requiredVariables = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  if (requiredVariables.some((name) => !process.env[name])) {
    return next(Object.assign(new Error('Photo uploads are not configured on the server.'), { statusCode: 503 }));
  }
  return upload.single('photo')(request, response, next);
}

module.exports = { upload, uploadItemPhoto };