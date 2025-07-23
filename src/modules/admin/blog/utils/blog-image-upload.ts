/*
import { Request } from 'express';
 
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { diskStorage,File } from 'multer';

export const blogImageStorage = {
  storage: diskStorage({
    destination: './uploads/blog-images',
    filename: (req, file, callback) => {
      const ext = extname(file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;
      callback(null, uniqueName);
    },
     }),
     fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}; */
import { Request } from 'express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { Multer } from 'multer'; // Import Multer namespace

export const blogImageStorage = {
  storage: diskStorage({
    destination: './uploads/blog-images',
    filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
      const ext = extname(file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
};