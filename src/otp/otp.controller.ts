import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { PermissionsGuard } from 'src/auth/guards/RBACGuard';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Resource } from 'lib/decorators/resource.decorator';
import { Resources } from '@prisma/client';
import { requireTenantId } from 'lib/common/tenant.util';

@Controller('otp')
@Resource(Resources.OTP)
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
@ApiBearerAuth()
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requeseted resource',
})
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('resend/:employeeId')
  create(
    @Request() req,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    const { tenantId } = requireTenantId(req);
    return this.otpService.resendOtp(tenantId, employeeId);
  }
}
