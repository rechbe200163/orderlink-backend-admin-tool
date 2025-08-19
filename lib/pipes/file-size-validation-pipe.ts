import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const oneMb = 1024 * 1024;
    if (!value || !value.size) {
      throw new BadRequestException('File size is not defined');
    }
    if (value.size > oneMb) {
      throw new BadRequestException('File size exceeds 1MB');
    }
    return value;
  }
}
