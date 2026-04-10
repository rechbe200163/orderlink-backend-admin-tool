import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AuthResult, JwtPayload, SanitizedEmployee } from 'lib/types';
import { TenantDbContext } from 'lib/tenant-db-context';
import { OtpService } from 'src/otp/otp.service';
import type { TenantRequest } from 'src/middlewares/tenant.middleware';

export type AuthInput = {
  email: string;
  password: string;
};

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly req: TenantRequest,
    private readonly db: TenantDbContext,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (!input.email || !input.password || input.password.trim() === '') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.validateUser(input);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signIn(user);
  }

  async validateUser(authInput: AuthInput): Promise<SanitizedEmployee | null> {
    console.log('Login email:', JSON.stringify(authInput.email));

    const user = await this.db.prisma.employees.findUnique({
      where: { email: authInput.email },
    });

    console.log('User found:', !!user);

    if (!user) {
      return null;
    }

    console.log('Stored hash:', user.password);

    const isPasswordValid = await compare(authInput.password, user.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return null;
    }

    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async signIn(user: SanitizedEmployee): Promise<AuthResult> {
    const tenantId = this.req.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const tokenPayload: JwtPayload = {
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      superAdmin: user.superAdmin,
      tenantId,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);
    const decoded = this.jwtService.decode(accessToken) as {
      iat: number;
      exp: number;
    } | null;

    if (!decoded?.iat || !decoded?.exp) {
      throw new UnauthorizedException('Could not decode access token');
    }

    return {
      token: {
        accessToken,
        issuedAt: decoded.iat * 1000,
        expiresAt: decoded.exp * 1000,
      },
      user,
    };
  }

  async renewSession(user: SanitizedEmployee): Promise<AuthResult> {
    return this.signIn(user);
  }

  async signInWithOtp(code: number): Promise<AuthResult> {
    const otp = await this.otpService.validateOTP(code);

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const employee = await this.db.prisma.employees.findUnique({
      where: { employeeId: otp.employeeId },
    });

    if (!employee) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.otpService.markOtpAsUsed(code);

    const { password, ...sanitizedEmployee } = employee;
    return this.signIn(sanitizedEmployee);
  }
}
