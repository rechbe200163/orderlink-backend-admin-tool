import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { CustomersService } from 'src/customers/customers.service';
import { SanitizedCustomer, SanitizedEmployee } from 'lib/types';
import { EmployeesRepository } from 'src/employees/employees.repository';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { OtpService } from 'src/otp/otp.service';
import { TenantsService } from 'src/tenants/tenants.service';
import { TenantDto } from 'src/tenants/dto/tenant-entity.dto';
import { SanitizedEmployeeDto } from './dto/sanitized-employee.dto';

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
  // tenant: TenantDto;
};

export type JwtPayload = SanitizedEmployee & {
  tenantId: string;
};

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
    const siteConfig = await this.prismaService.client.siteConfig.findFirst();

    if (!siteConfig?.tenantId) {
      throw new InternalServerErrorException(
        'Tenant ID not found please contact support',
      );
    }
    return this.signIn(user, siteConfig.tenantId);
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

  async signIn(user: SanitizedEmployee, tenantId: string): Promise<AuthResult> {
    const tokenPayload = {
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      superAdmin: user.superAdmin,
      tenantId: tenantId,
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    const { tenantId: _, ...sanitized } = tokenPayload;
    return {
      token: {
        accessToken,
        issuedAt: Math.floor(Date.now()), // Current time in milliseconds
        expiresAt: Math.floor(Date.now()) + 30 * 60 * 1000, // 30 minutes later
      },
      user: sanitized as SanitizedEmployee,
    };
  }

  async renewSession(
    user: SanitizedEmployee,
    tenantId: string,
  ): Promise<AuthResult> {
    return this.signIn(user, tenantId);
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
    const siteConfig = await this.prismaService.client.siteConfig.findFirst();

    if (!siteConfig?.tenantId) {
      throw new InternalServerErrorException(
        'Tenant ID not found please contact support',
      );
    }
    await this.otpService.markOtpAsUsed(code);
    return this.signIn(employee, siteConfig.tenantId);
  }
}
