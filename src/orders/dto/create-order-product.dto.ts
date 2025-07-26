import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateOrderProductDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ type: Number, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productAmount: number;
}
