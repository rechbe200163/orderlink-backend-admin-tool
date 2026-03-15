import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('File is required');
    }

    const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const isValid = supportedMimeTypes.includes(value.mimetype);

    if (!isValid) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG and WEBP are allowed.',
      );
    }

    return value;
  }
}
