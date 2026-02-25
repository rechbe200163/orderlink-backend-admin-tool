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

}
