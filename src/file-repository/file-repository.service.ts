import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
@Injectable()
export class FileRepositoryService {
  private readonly supabase: SupabaseClient;
  private readonly supabaseUrl: string;
  private readonly buckets: {
    products: string;
    invoices: string;
    siteConfig: string;
  };

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.requireEnv('SUPABASE_URL');
    const serviceRoleKey = this.requireEnv('SUPABASE_SERVICE_ROLE');
    this.buckets = {
      products: this.requireEnv('SUPABASE_PRODUCTS_BUCKET'),
      invoices: this.requireEnv('SUPABASE_INVOICES_BUCKET'),
      siteConfig: this.requireEnv('SUPABASE_SITE_CONFIG_BUCKET'),
    };
    this.supabase = createClient(this.supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  async bucketsList(): Promise<any[]> {
    const { data, error } = await this.supabase.storage.listBuckets();
    if (error) {
      throw new InternalServerErrorException(
        `Supabase listBuckets failed: ${error.message}`,
      );
    }
    return data;
  }

  // async getFile(filename: string) {
  //   try {
  //     return this.getPublicUrl(filename, 'products');
  //   } catch (error) {
  //     console.error('Could not generate Supabase URL', error);
  //     return '';
  //   }
  // }

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
    const bucketName = this.getBucketName(productImage.fieldname);
    const { error } = await this.supabase.storage
      .from(bucketName)
      .upload(filename, productImage.buffer, {
        contentType: productImage.mimetype,
      });
    if (error) {
      throw new InternalServerErrorException(
        `Supabase upload failed: ${error.message}`,
      );
    }
    return filename;
  }

  getPublicUrl(path: string, bucket: keyof FileRepositoryService['buckets']) {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.buckets[bucket]}/${path}`;
  }

  private getBucketName(fieldname: string | undefined): string {
    if (fieldname === 'logo') {
      return this.buckets.siteConfig;
    }
    if (fieldname === 'invoice') {
      return this.buckets.invoices;
    }
    return this.buckets.products;
  }

  private requireEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required env var: ${key}`);
    }
    return value;
  }
}
