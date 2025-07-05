import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class AverageOrderValueStatsDto {
  @ApiProperty()
  @IsInt()
  currentMonthAIV: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  lastMonthAIV: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  percentageChange: number | null;
}
