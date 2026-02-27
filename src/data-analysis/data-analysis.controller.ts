import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DataAnalysisService } from './data-analysis.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Resource } from 'lib/decorators/resource.decorator';
import { Resources } from 'src/rbac/resources.enum';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiQuery,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { DataAnalysisTokenServiceService } from './external-api.token-service';

@Controller('data-analysis')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.CUSTOMER)
@CacheTTL(60 * 60 * 1000) // Cache for 1 hour
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DataAnalysisController {
  constructor(
    private readonly dataAnalysisService: DataAnalysisService,
    private readonly tokenService: DataAnalysisTokenServiceService,
  ) {}

  @Get('orders-amount')
  @ApiServiceUnavailableResponse({
    description: 'Data analysis service temporarily unavailable',
  })
  @ApiQuery({
    name: 'last_days',
    required: false,
    description: 'Number of last days to include in the analysis',
    example: 0,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Whether to include the current month in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Whether to include the current year in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'show_zeros',
    required: false,
    description:
      'Whether to include days with zero orders in the analysis (only applies if last_days is set)',
    example: false,
  })
  async get_order_amount(
    @Request() req,
    @Query('last_days') last_days: number = 0,
    @Query('month') month: boolean = false,
    @Query('year') year: boolean = false,
    @Query('show_zeros') show_zeros: boolean = false,
  ) {
    const { email } = req.user;
    const token = await this.tokenService.getToken(email);
    return this.dataAnalysisService.get_orders_amount(
      token,
      last_days,
      month,
      year,
      show_zeros,
    );
  }

  @Get('products-mostly-bought')
  @ApiServiceUnavailableResponse({
    description: 'Data analysis service temporarily unavailable',
  })
  @ApiQuery({
    name: 'last_days',
    required: false,
    description: 'Number of last days to include in the analysis',
    example: 0,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Whether to include the current month in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Whether to include the current year in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top products to return',
    example: 5,
  })
  async get_products_mostly_bought(
    @Request() req,
    @Query('last_days') last_days: number = 0,
    @Query('month') month: boolean = false,
    @Query('year') year: boolean = false,
    @Query('limit') limit: number = 5,
  ) {
    const { email } = req.user;
    const token = await this.tokenService.getToken(email);
    return this.dataAnalysisService.get_products_mostly_bought(
      token,
      last_days,
      month,
      year,
      limit,
    );
  }


  @Get('customers-growth')
  @ApiServiceUnavailableResponse({
    description: 'Data analysis service temporarily unavailable',
  })
  @ApiQuery({
    name: 'one_day',
    required: true,
    description: 'Whether to include the previous day in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'seven_days',
    required: true,
    description: 'Whether to include the last 7 days in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Whether to include the current month in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Whether to include the current year in the analysis',
    example: true,
  })
  async get_customers_growth(
    @Request() req,
    @Query('one_day') one_day: boolean = false,
    @Query('seven_days') seven_days: boolean = false,
    @Query('month') month: boolean = false,
    @Query('year') year: boolean = false,
  ) {
    const { email } = req.user;
    const token = await this.tokenService.getToken(email);
    return this.dataAnalysisService.get_customers_growth(
      token,
      one_day,
      seven_days,
      month,
      year,
    );
  }

  @Get('orders-growth')
  @ApiServiceUnavailableResponse({
    description: 'Data analysis service temporarily unavailable',
  })
  @ApiQuery({
    name: 'one_day',
    required: true,
    description: 'Whether to include the previous day in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'seven_days',
    required: true,
    description: 'Whether to include the last 7 days in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Whether to include the current month in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Whether to include the current year in the analysis',
    example: true,
  })
  async get_orders_growth(
    @Request() req,
    @Query('one_day') one_day: boolean = false,
    @Query('seven_days') seven_days: boolean = false,
    @Query('month') month: boolean = false,
    @Query('year') year: boolean = false,
  ) {
    const { email } = req.user;
    const token = await this.tokenService.getToken(email);
    return this.dataAnalysisService.get_orders_growth(
      token,
      one_day,
      seven_days,
      month,
      year,
    );
  }

  @Get('products-amount')
  @ApiServiceUnavailableResponse({
    description: 'Data analysis service temporarily unavailable',
  })
  @ApiQuery({
    name: 'well_stocked',
    required: false,
    description: 'Whether to include only well-stocked products in the analysis',
    example: true,
  })
  @ApiQuery({
    name: 'out_of_stock',
    required: false,
    description: 'Whether to include only out-of-stock products in the analysis',
    example: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top products to return',
    example: 5,
  })
  async get_products_amount(
    @Request() req,
    @Query('well_stocked') well_stocked: boolean = false,
    @Query('out_of_stock') out_of_stock: boolean = false,
    @Query('limit') limit: number = 5,
  ) {
    const { email } = req.user;
    const token = await this.tokenService.getToken(email);
    return this.dataAnalysisService.get_products_amount(
      token,
      well_stocked,
      out_of_stock,
      limit,
    );
  }


  @Get('products-orders-correlation')
  @ApiServiceUnavailableResponse({
    description: 'Data analysis service temporarily unavailable',
  })
  async get_products_orders_correlation(@Request() req) {
    const { email } = req.user;
    const token = await this.tokenService.getToken(email);
    return this.dataAnalysisService.get_products_orders_correlation(token);

  }

}
