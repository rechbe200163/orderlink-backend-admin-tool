import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { SanitizedEmployee } from 'lib/types';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { OtpService } from 'src/otp/otp.service';
import { TenantStatus } from '@prisma/client';

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
  tenantInfo: TenantInfo;
};
type TenantInfo = {
  maxEmployees: number;
  trialEndsAt: Date | null;
  trialStartedAt: Date | null;
  status: TenantStatus;
  enabledModules: string[];
};

export type JwtPayload = SanitizedEmployee;

@Injectable()
export class AuthService {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (!input.email || !input.password || input.password.trim() === '') {
      console.error('Invalid credentials provided');
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.validateUser(input);
    if (!user) {
      console.error('User not found or invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signIn(user);
  }

  async validateUser(authInput: AuthInput): Promise<SanitizedEmployee | null> {
    const user = await this.prismaService.client.employees.findEmployeeByEmail(
      authInput.email,
    );
    console.log('Validating user:', user);
    if (user && (await compare(authInput.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(user: SanitizedEmployee): Promise<AuthResult> {
    const tenantData = await this.prismaService.client.tenantData.findFirst({
      select: {
        enabledModules: { select: { moduleName: true } },
        status: true,
        trialStartedAt: true,
        trialEndsAt: true,
        maxEmployees: true,
      },
    });

    if (!tenantData) {
      throw new InternalServerErrorException('Tenant data not found');
    }

    const tokenPayload = {
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      superAdmin: user.superAdmin,
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    const { ...sanitized } = tokenPayload;
    return {
      token: {
        accessToken,
        issuedAt: Math.floor(Date.now()), // Current time in milliseconds
        expiresAt: Math.floor(Date.now()) + 30 * 60 * 1000, // 30 minutes later
      },
      user: sanitized as SanitizedEmployee,
      tenantInfo: {
        maxEmployees: tenantData.maxEmployees,
        trialEndsAt: tenantData.trialEndsAt,
        trialStartedAt: tenantData.trialStartedAt,
        status: tenantData.status,
        enabledModules: tenantData.enabledModules.map(
          (module) => module.moduleName,
        ),
      },
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
    const employee = await this.prismaService.client.employees.findUnique({
      where: { employeeId: otp.employeeId },
    });
    if (!employee) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.otpService.markOtpAsUsed(code);
    return this.signIn(employee);
  }
}
