import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class RevenueStatsDto {
  @ApiProperty()
  @IsInt()
  currentMonthRevenue: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  percentageChange: number | null;
}
