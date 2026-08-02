const multer = require('multer');

// Memory storage instead of disk — the file buffer goes straight to
// Cloudinary (see config/cloudinary.js) rather than being saved to the
// local filesystem, which Render's free tier wipes on every redeploy.
const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;
