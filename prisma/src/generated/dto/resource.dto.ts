import { Resources } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ResourceDto {
  @ApiProperty({
    enum: Resources,
  })
  name: Resources;
  description: string | null;
  deleted: boolean;
}
