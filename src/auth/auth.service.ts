import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { CustomersService } from 'src/customers/customers.service';
import { SanitizedCustomer, SanitizedEmployee } from 'lib/types';
import { EmployeesRepository } from 'src/employees/employees.repository';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';

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

@Injectable()
export class AuthService {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,

    private jwtService: JwtService,
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
      role: user.role,
      superAdmin: user.superAdmin,
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    return {
      // iat: Math.floor(Date.now() / 1000), // Issued at time
      token: {
        accessToken,
        issuedAt: Math.floor(Date.now()), // Current time in milliseconds
        expiresAt: Math.floor(Date.now()) + 30 * 60 * 1000, // 30 seconds later
      },
      user: tokenPayload as SanitizedEmployee,
    };
  }
}
