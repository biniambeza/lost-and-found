const { randomUUID } = require('node:crypto');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

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

  upload.single('photo')(request, response, async (err) => {
    if (err) return next(err);
    if (!request.file) return next();

    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'lost-and-found/items',
            public_id: randomUUID(),
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(request.file.buffer);
      });

      request.file.path = uploadResult.secure_url;
      return next();
    } catch (uploadError) {
      return next(Object.assign(new Error('Failed to upload image to cloud storage.'), { statusCode: 500 }));
    }
  });
}

module.exports = { upload, uploadItemPhoto };