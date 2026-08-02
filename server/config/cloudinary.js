const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads an in-memory image buffer (from multer's memoryStorage) to
// Cloudinary and resolves with the permanent, publicly-accessible URL.
// This replaces saving files to disk — Render's free tier wipes its
// filesystem on every redeploy, so anything saved locally disappears.
// Cloudinary storage is independent of the backend and survives redeploys.
function uploadBuffer(buffer, folder = 'rebinit') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadBuffer };
