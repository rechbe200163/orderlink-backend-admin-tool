import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { SanitizedEmployee, UserRequest } from 'lib/types';
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AuthInputDto })
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  login(@Body() body: AuthInputDto) {
    return this.authService.authenticate(body);
  }

  @Get('renew')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  renewToken(@Request() request: UserRequest) {
    if (!request.user) {
      throw new NotImplementedException('User not found in request');
    }

    const user: SanitizedEmployee = {
      employeeId: request.user.employeeId,
      email: request.user.email,
      firstName: request.user.firstName,
      lastName: request.user.lastName,
      roleId: request.user.roleId,
      superAdmin: request.user.superAdmin,
    };

    return this.authService.signIn(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @ApiBearerAuth()
  getProfile(@Request() request: UserRequest) {
    if (!request.user) {
      throw new NotImplementedException('User not found in request');
    }

    return request.user;
  }

  @Post('otp/:otp')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiParam({
    name: 'otp',
    required: true,
    type: String,
    description: 'One-time password for validation',
  })
  validateOtp(@Param('otp', ParseIntPipe) otp: number) {
    return this.authService.signInWithOtp(otp);
  }

  @Post('renewSession')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  renewSession(@Request() request: UserRequest) {
    if (!request.user) {
      throw new NotImplementedException('User not found in request');
    }

    const user: SanitizedEmployee = {
      employeeId: request.user.employeeId,
      email: request.user.email,
      firstName: request.user.firstName,
      lastName: request.user.lastName,
      roleId: request.user.roleId,
      superAdmin: request.user.superAdmin,
    };

    return this.authService.renewSession(user);
  }
}
