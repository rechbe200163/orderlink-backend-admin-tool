import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  Query,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Actions } from '@prisma/client';
import { Resources } from '../rbac/resources.enum';
import { Resource } from 'lib/decorators/resource.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import { CreateEmployeesDto } from 'prisma/src/generated/dto/create-employees.dto';
import { UpdateEmployeesDto } from 'prisma/src/generated/dto/update-employees.dto';
import { MAX_PAGE_SIZE } from 'lib/constants';
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { EmployeesDto } from 'prisma/src/generated/dto/employees.dto';
import { MaxEmployeeGuard } from 'src/auth/guards/max-employee.guard';

@Controller('employees')
@UseInterceptors(CacheInterceptor)
@Resource(Resources.EMPLOYEE)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: EmployeesDto })
  getProfile(@Request() req) {
    const { employeeId } = req.user;
    return this.employeesService.findById(employeeId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateEmployeesDto })
  @ApiOkResponse({ type: EmployeesDto })
  updateProfile(@Request() req, @Body() updateEmployeeDto: UpdateEmployeesDto) {
    const { employeeId } = req.user;
    return this.employeesService.updateProfile(employeeId, updateEmployeeDto);
  }

  @Post()
  @ApiBody({
    type: CreateEmployeesDto,
    description: 'Create a new employee',
  })
  @UseGuards(MaxEmployeeGuard)
  create(@Body() createEmployeeDto: CreateEmployeesDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    description: 'Number of employees to return per page',
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
    name: 'search',
    description: 'Search employees by email, first name or last name',
    type: String,
    required: false,
    example: 'john',
  })
  @ApiQuery({
    name: 'permissions',
    description: 'Permissions to filter employees by',
    type: Object,
    required: false,
    example: {
      resource: Resources.EMPLOYEE,
      action: Actions.READ,
      allowed: true,
    },
  })
  @ApiOkResponse({
    description: 'List of employees',
    type: PagingResultDto<EmployeesDto>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('permissions')
    permissions?: {
      resource: Resources;
      action: Actions;
      allowed: boolean;
    },
  ) {
    if (limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    }
    return this.employeesService.findAll(page, limit, search, permissions);
  }

  @Get(':employeeId')
  @ApiQuery({
    name: 'includeOtp',
    required: false,
    type: Boolean,
    example: true,
    description: 'Include OTP data in the response',
  })
  findById(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('includeOtp') includeOtp?: string,
  ) {
    const withOtp = includeOtp === 'true';
    return this.employeesService.findById(employeeId, withOtp);
  }

  @Patch(':employeeId')
  update(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeesDto,
  ) {
    return this.employeesService.update(employeeId, updateEmployeeDto);
  }
}
