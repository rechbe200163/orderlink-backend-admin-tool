import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class CustomerStatsDto {
  @ApiProperty()
  @IsInt()
  currentMonthSignUps: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  percentageChange: number | null;
}
