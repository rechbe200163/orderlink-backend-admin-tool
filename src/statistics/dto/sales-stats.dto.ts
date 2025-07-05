import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class SalesStatsDto {
  @ApiProperty()
  @IsInt()
  currentMonthSales: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  percentageChange: number | null;
}
