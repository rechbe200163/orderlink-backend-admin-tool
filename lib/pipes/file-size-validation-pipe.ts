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
    const oneGb = 1024 * 1024 * 1024;

    if (value.size > oneGb) {
      throw new BadRequestException('File size exceeds 1GB');
    }
    return value;
  }
}
