import fs from 'fs-extra';
import { extname } from 'path';
import multer from 'multer';

fs.mkdirs('_temp/file-uploads');

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '_temp/file-uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + extname(file.originalname)); //Appending extension
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5, // 5mb
};

// export const upload = multer({
//   storage,
//   limits
// });

export const multerOptions = { storage, limits };
