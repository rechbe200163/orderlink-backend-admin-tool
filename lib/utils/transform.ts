import { plainToInstance } from 'class-transformer';

export function transformResponse<T, V>(cls: new () => T, data: V): T {
  return plainToInstance(cls, data, { excludeExtraneousValues: true });
}
