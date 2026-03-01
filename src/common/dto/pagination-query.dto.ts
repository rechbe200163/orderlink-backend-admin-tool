// src/common/dto/pagination-query.dto.ts
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SortOrder } from '../enums/sort-order.enum';
import { MAX_PAGE_SIZE } from 'lib/constants';

export class PaginationQueryDto {
  @ApiProperty({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @IsOptional()
  limit: number = 10;

  @ApiProperty({ example: 1, default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  // bewusst generisch: Feature muss whitelisten
  @ApiPropertyOptional({
    example: 'name',
    description: 'Sort field (feature-specific)',
  })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.ASC })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder;
}
