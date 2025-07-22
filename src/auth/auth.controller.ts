import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthGuard } from './guards/auth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthResultDto } from './dto/auth-result.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AuthInputDto })
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  login(@Body() body: AuthInputDto) {
    console.log('Received login request:', body);
    return this.authService.authenticate(body);
  }

  @Get('renew')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  renewToken(@Request() request) {
    if (!request.user) {
      throw new NotImplementedException('User not found in request');
    }
    return this.authService.signIn(request.user);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  getProfile(@Request() request) {
    return request.user;
  }

  @Post('otp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResultDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiQuery({
    name: 'otp',
    required: true,
    type: String,
    description: 'One-time password for validation',
  })
  async validateOtp(@Query('otp') otp: string) {
    console.log('Received OTP validation request:', otp);
    return this.authService.signInWithOtp(otp);
  }
}
