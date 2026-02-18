import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateActionDto {
  @ApiProperty({
    description: 'The unique key for the action',
    example: 'CREATE',
  })
  @Transform(({ value }) => value.toUpperCase())
  key: string;
  @ApiProperty({
    description: 'A brief description of the action',
    example: 'This action allows users to create new resources.',
  })
  @IsString()
  description?: string;
}
