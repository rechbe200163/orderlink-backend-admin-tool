import { ApiProperty } from '@nestjs/swagger';

export class QuickStatsDto {
  @ApiProperty()
  totalCustomers: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalCategories: number;

  @ApiProperty()
  totalRoutes: number;

  @ApiProperty()
  totalInvoices: number;
}
