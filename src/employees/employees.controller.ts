import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UseGuards,
  ParseUUIDPipe,
  Query,
  Request,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { HttpCacheInterceptor } from 'lib/interceptors/custom.cache-intercaptor';
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
import { PagingResultDto } from 'lib/dto/genericPagingResultDto';
import { MaxEmployeeGuard } from 'src/auth/guards/max-employee.guard';
import { EmployeesDto } from './dto/employees.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('employees')
@UseInterceptors(HttpCacheInterceptor)
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
    name: 'search',
    description: 'Search employees by email, first name or last name',
    type: String,
    required: false,
    example: 'john',
  })
  @ApiQuery({
    name: 'includeRole',
    description: 'Whether to include role information in the response',
    type: Boolean,
    required: false,
    example: true,
  })
  @ApiOkResponse({
    description: 'List of employees',
    type: PagingResultDto<EmployeesDto>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  findAll(
    @Request() req,
    @Query() query: PaginationQueryDto,
    @Query('includeRole', new DefaultValuePipe(false), ParseBoolPipe)
    includeRole: boolean = false,
    @Query('search')
    search?: string,
  ) {
    const { page, limit, sort, order } = query;
    const { employeeId } = req.user;
    return this.employeesService.findAll(
      page,
      limit,
      includeRole,
      sort,
      order,
      search,
      employeeId,
    );
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
