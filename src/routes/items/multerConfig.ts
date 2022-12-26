import fs from 'fs-extra';
import { extname } from 'path';
import multer from 'multer';
import { MAX_UPLOAD_SIZE, UPLOADS_DIR } from '../../utils/consts.js';
import { nanoid } from 'nanoid';

fs.mkdirs(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + extname(file.originalname)); //Appending extension
  },
});

const limits = {
  fileSize: MAX_UPLOAD_SIZE, // 10mb
};

export const multerOptions = { storage, limits };
