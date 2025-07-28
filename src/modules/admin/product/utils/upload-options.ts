// upload-options.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const productImageUploadOptions = {
  storage: diskStorage({
    destination: './uploads/product-images',
    filename: (_req, file, cb) => {
       const ext = extname(file.originalname).toLowerCase();
       const timestamp = Date.now(); 
       const originalName = file.originalname
        .toLowerCase() /// lower case
       .replace(ext, '') // Remove existing extension
        .replace(/[^\w\-]/g, '_') // Replace special chars with underscores
        .substring(0, 50); // Limit length to 50 chars
     
     const uniqueName = `${originalName}_${timestamp}${ext}`;
    //  const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
fileFilter: (
    req: Request,
    file: Express.Multer.File, // ✅ Correct type here
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = extname(file.originalname).toLowerCase().substring(1); // remove dot
    const mimeOk = allowedTypes.test(file.mimetype);
    const extOk = allowedTypes.test(ext);

    if (mimeOk && extOk) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Only JPG, JPEG, and PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
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