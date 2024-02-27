const path = require('path');

const multer = require('multer');

const tempUploads = path.join(process.cwd(), 'tmp');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploads);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (
      !allowedExtensions.includes(extension) ||
      !allowedMimeTypes.includes(mimetype)
    ) {
      return cb(null, false);
    }
    return cb(null, true);
  },
});

module.exports = fileUpload;
