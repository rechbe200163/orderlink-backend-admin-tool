import { Injectable } from '@nestjs/common';
import { InjectMinio } from 'src/minio/minio.decorator';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { File } from '@nest-lab/fastify-multer';
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

  uploadFile(productImage: File): Promise<string> {
    console.log(
      'Uploading file:',
      productImage.encoding,
      productImage.mimetype,
      productImage.size,
      productImage.fieldname,
    );
    return new Promise((resolve, reject) => {
      const originalName = productImage.fieldname || 'file';
      const ext = productImage.mimetype?.split('/')[1] ?? '';
      const cleanName = slugify(originalName, {
        lower: true,
        remove: /[0-9]/g,
        trim: true,
        strict: true,
      });
      const filename = `${randomUUID()}-${cleanName}${ext ? '.' + ext : ''}`;
      this.minioService.putObject(
        this._bucketName,
        filename,
        productImage.buffer!,
        productImage.size,
        (error, objInfo) => {
          if (error) {
            reject(error);
          } else {
            resolve(filename);
          }
        },
      );
    });
  }
}
