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

  uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const cleanName = slugify(file.originalname, {
        lower: true,
        remove: /[0-9]/g,
        trim: true,
        strict: true,
      });
      const filename = `${randomUUID()}-${cleanName}`;
      this.minioService.putObject(
        this._bucketName,
        filename,
        file.buffer,
        file.size,
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
