// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Inject, Injectable } from '@nestjs/common';
// import { Cache } from 'cache-manager';

// @Injectable()
// export class RedisCacheService {
//   constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

//   async getKeys(key: string): Promise<any> {
//     return await this.cache.stores
//   }

//   async getValue(key: string): Promise<string> {
//     return await this.cache.get(key);
//   }

//   async save(key: string, value: any, ttl: number): Promise<any> {
//     return await this.cache.set(key, value, {
//       ttl: ttl,
//     });
//   }

//   async delete(key: string): Promise<void> {
//     return await this.cache.del(key);
//   }

//   async getMultipleKeydata(key: string): Promise<any> {
//     const redisKeys = await this.getKeys(key);
//     const data: { [key: string]: any } = {};
//     for (const key of redisKeys) {
//       data[key] = await this.getValue(key);
//     }
//     return allData;
//   }
// }
