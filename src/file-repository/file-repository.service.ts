import { Injectable } from '@nestjs/common';
import { InjectMinio } from 'src/minio/minio.decorator';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
@Injectable()
export class FileRepositoryService {
  protected _bucketName = 'product-images';

  constructor(@InjectMinio() private readonly minioService: Minio.Client) {}

  async bucketsList() {
    return await this.minioService.listBuckets();
  }

  async getFile(filename: string) {
    try {
      return await this.minioService.presignedUrl(
        'GET',
        this._bucketName,
        filename,
        24 * 60 * 60, // 1 day in seconds
      );
    } catch (error) {
      console.error('Could not generate minio URL', error);
      return '';
    }
  }

  async uploadFile(productImage: Express.Multer.File): Promise<string> {
    console.log(
      'Uploading file:',
      productImage.originalname,
      productImage.mimetype,
      productImage.size,
      productImage.fieldname,
    );
    const originalName = productImage.originalname || 'file';
    const ext = productImage.mimetype?.split('/')[1] ?? '';
    const cleanName = slugify(originalName, {
      lower: true,
      remove: /[0-9]/g,
      trim: true,
      strict: true,
    });
    const filename = `${randomUUID()}-${cleanName}${ext ? '.' + ext : ''}`;
    await this.minioService.putObject(
      this._bucketName,
      filename,
      productImage.buffer,
      productImage.size,
    );
    return filename;
  }
}
