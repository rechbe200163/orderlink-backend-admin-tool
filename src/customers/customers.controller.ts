import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Resource } from 'lib/decorators/resource.decorator';
import { BusinessSector } from '@prisma/client';
import { Resources } from '../rbac/resources.enum';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerPagingResultDto } from './dto/customer-paging.dto';
import { CreateCustomerDto } from 'src/customers/dto/create-customer.dto';
import { CustomerDto } from 'src/customers/dto/customer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { UpdateCustomerDto } from 'src/customers/dto/update-customer.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';

@Controller('customers')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.CUSTOMER)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':reference')
  @ApiParam({
    name: 'reference',
    description: 'Customer reference number',
    type: Number,
    required: true,
    example: 123456789,
  })
  @ApiOkResponse({ type: CustomerDto })
  @ApiNotFoundResponse({
    description: 'Customer not found',
  })
  async findCustomerByReference(
    @Param('reference', ParseIntPipe) reference: number,
  ) {
    return await this.customersService.findCustomerByReference(reference);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    description: 'Number of customers to return per page',
    type: Number,
    default: 10,
    required: true,
    maximum: MAX_PAGE_SIZE,
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number to return',
    type: Number,
    default: 1,
    required: true,
    example: 1,
  })
  @ApiQuery({
    name: 'businessSector',
    description: 'Filter customers by business sector',
    enum: BusinessSector,
    required: false,
    example: BusinessSector.RETAIL,
    default: undefined,
  })
  @ApiOkResponse({ type: CustomerPagingResultDto })
  async getCustomers(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query(
      'businessSector',
      new ParseEnumPipe(BusinessSector, { optional: true }),
    )
    businessSector?: BusinessSector | undefined,
  ) {
    const maxLimit = MAX_PAGE_SIZE; // Define a maximum limit for pagination
    if (limit > maxLimit) {
      throw new BadRequestException(`Limit cannot exceed ${maxLimit}`);
    }
    console.log(
      `Fetching customers with limit: ${limit}, page: ${page}, businessSector: ${businessSector}`,
    );
    return await this.customersService.getCustomers(
      limit,
      page,
      businessSector,
    );
  }

  @Post()
  @ApiBody({
    description: 'Create a new customer',
    type: CreateCustomerDto,
  })
  @ApiCreatedResponse({
    description: 'Customer created successfully',
    type: CustomerDto,
  })
  @ApiConflictResponse({
    description: 'Customer with this email already exists',
  })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    const data = await this.customersService.createCustomer(createCustomerDto);
    console.log('Customer created:', data);
    return data;
  }

  @Patch(':reference')
  @ApiParam({
    name: 'reference',
    description: 'Customer reference number',
    type: Number,
    required: true,
    example: 123456789,
  })
  @ApiBody({
    description: 'Update customer details',
    type: UpdateCustomerDto,
  })
  async updateCustomer(
    @Param('reference', ParseIntPipe) reference: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customersService.updateCustomer(
      reference,
      updateCustomerDto,
    );
  }
}
