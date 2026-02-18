import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { SanitizedEmployee } from 'lib/types';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma.service';

type AuthInput = {
  email: string;
  password: string;
};

export type Token = {
  accessToken: string;
  issuedAt: number;
  expiresAt: number;
};

type AuthResult = {
  token: Token;
  user: SanitizedEmployee;
};

export type JwtPayload = SanitizedEmployee;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
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
    const user = await this.prisma.db.employees.findUnique({
      where: { email: authInput.email },
    });

    if (user && (await compare(authInput.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(user: SanitizedEmployee): Promise<AuthResult> {
    const tokenPayload = {
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      superAdmin: user.superAdmin,
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    const { ...sanitized } = tokenPayload;

    // Decode JWT to get actual issued and expiry times
    const decoded = this.jwtService.decode(accessToken) as any;

    return {
      token: {
        accessToken,
        issuedAt: decoded.iat * 1000, // Convert to milliseconds
        expiresAt: decoded.exp * 1000, // Convert to milliseconds
      },
      user: sanitized as SanitizedEmployee,
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
    const employee = await this.prisma.db.employees.findUnique({
      where: { employeeId: otp.employeeId },
    });
    if (!employee) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.otpService.markOtpAsUsed(code);
    return this.signIn(employee);
  }
}
