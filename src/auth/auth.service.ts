import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { CustomersService } from 'src/customers/customers.service';
import { SanitizedCustomer, SanitizedEmployee } from 'lib/types';
import { EmployeesService } from 'src/employee/employee.service';

type AuthInput = {
  email: string;
  password: string;
};

type AuthResult = {
  // iat: number;
  token: string;
  user: SanitizedEmployee;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeesService,
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
    const user = await this.employeeService.findEmployeeByEmail(
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
    };
    const accessToken = this.jwtService.sign(tokenPayload);
    return {
      // iat: Math.floor(Date.now() / 1000), // Issued at time
      token: accessToken,
      user: tokenPayload as SanitizedEmployee,
    };
  }
}
