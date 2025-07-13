import { Resources } from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({
    enum: Resources,
  })
  name: Resources;
  description?: string;
}
