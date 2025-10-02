import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { SupabaseClient } from '@supabase/supabase-js';
import { InjectSupabaseClient } from 'src/supabase-storage/supabase-storage.decorator';

export type StorageBucket = 'products' | 'siteConfig' | 'invoices';

@Injectable()
export class FileRepositoryService {
  constructor(
    @InjectSupabaseClient()
    private readonly supabaseClient: SupabaseClient,
    private readonly configService: ConfigService,
  ) {}

  async bucketsList(): Promise<any> {
    const { data, error } = await this.supabaseClient.storage.listBuckets();
    if (error) {
      throw new InternalServerErrorException('Failed to list storage buckets');
    }
    return data;
  }

  async uploadFile(
    tenantId: string,
    file: Express.Multer.File,
    bucket: StorageBucket,
  ): Promise<string> {
    if (!file?.buffer?.length) {
      throw new InternalServerErrorException('Uploaded file buffer is empty');
    }

    const objectPath = this.buildObjectPath(tenantId, file);
    const bucketName = this.resolveBucketName(bucket);

    const { error } = await this.supabaseClient.storage
      .from(bucketName)
      .upload(objectPath, file.buffer, {
        cacheControl: '3600',
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to upload file to bucket ${bucketName}`,
      );
    }

    return objectPath;
  }

  async getSignedUrl(
    bucket: StorageBucket,
    objectPath?: string | null,
    expiresInSeconds = 60 * 60 * 24, // 1 day
  ): Promise<string | null> {
    if (!objectPath) {
      return null;
    }

    if (objectPath.startsWith('http')) {
      return objectPath;
    }

    const bucketName = this.resolveBucketName(bucket);
    const { data, error } = await this.supabaseClient.storage
      .from(bucketName)
      .createSignedUrl(objectPath, expiresInSeconds);

    if (error) {
      return null;
    }

    return data?.signedUrl ?? null;
  }

  private buildObjectPath(tenantId: string, file: Express.Multer.File) {
    const originalName = file.originalname || 'file';
    const extension = file.mimetype?.split('/')?.[1] ?? '';
    const cleanName = slugify(originalName, {
      lower: true,
      remove: /[0-9]/g,
      trim: true,
      strict: true,
    });

    const fileNameParts = [randomUUID(), cleanName].filter(Boolean);
    const fileName = fileNameParts.join('-');
    const extSuffix = extension ? `.${extension}` : '';

    return `${tenantId}/${fileName}${extSuffix}`;
  }

  private resolveBucketName(bucket: StorageBucket): string {
    switch (bucket) {
      case 'products':
        return this.configService.getOrThrow<string>(
          'SUPABASE_PRODUCTS_BUCKET',
        );
      case 'siteConfig':
        return this.configService.getOrThrow<string>(
          'SUPABASE_SITE_CONFIG_BUCKET',
        );
      case 'invoices':
        return this.configService.getOrThrow<string>(
          'SUPABASE_INVOICES_BUCKET',
        );
      default:
        throw new InternalServerErrorException('Unknown storage bucket type');
    }
  }
}
