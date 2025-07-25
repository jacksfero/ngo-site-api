// upload-options.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const productImageUploadOptions = {
  storage: diskStorage({
    destination: './uploads/product-images',
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(new Error('Only JPG/PNG files are allowed!'), false);
    } else {
      cb(null, true);
    }
  },
};

/*
// utils/multer.config.ts
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const productImageUploadOptions = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JPG, JPEG, and PNG are allowed!'), false);
    }
    cb(null, true);
  },
};
*/