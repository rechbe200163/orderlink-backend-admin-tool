import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    const isValid = supportedMimeTypes.includes(value.mimetype);

    if (!isValid) {
      throw new BadRequestException('Invalid file type');
    }
    return value;
  }
}
