import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: 'The unique key for the resource',
    example: 'ORDER',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  key: string;

  @ApiProperty({
    description: 'A brief description of the resource',
    example: 'Orders module access',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
