import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private maxSize: number = 2 * 1024 * 1024, // default 2MB
    private allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(`File too large. Max size is ${this.maxSize / 1024 / 1024} MB`);
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed: ${this.allowedTypes.join(', ')}`);
    }

    return file;
  }
}
