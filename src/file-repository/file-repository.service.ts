import { Injectable } from '@nestjs/common';
import { MemoryStorageFile } from '@blazity/nest-file-fastify';
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

  uploadFile(file: MemoryStorageFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const source = file as Partial<MemoryStorageFile> & {
        originalname?: string;
        filename?: string;
        originalFilename?: string;
        fieldname?: string;
      };

      const originalName =
        source.originalname ||
        source.filename ||
        source.originalFilename ||
        source.fieldname ||
        'file';

      const ext = source.mimetype?.split('/')[1] || '';
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
        source.buffer,
        source.size,
        (error) => {
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
