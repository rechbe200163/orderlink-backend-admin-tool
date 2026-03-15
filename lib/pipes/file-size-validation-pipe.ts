import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('File is required');
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (value.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB');
    }

    return value;
  }
}
