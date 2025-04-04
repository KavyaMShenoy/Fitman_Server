const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || 'profile-pictures',         // Fallback folder
    format: async (req, file) => file.mimetype.split('/')[1],           // Auto-detect format
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,  // Unique filename
    transformation: [
      { width: 500, height: 500, crop: 'limit' }                        // Resize and crop
    ]
  }
});

// Multer Middleware with Enhanced Error Handling
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },     // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and JPG files are allowed.'), false);
    }
    cb(null, true);
  }
});

// Error handling middleware for Multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { cloudinary, uploadMiddleware, handleUploadErrors };