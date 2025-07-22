import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Otp, Prisma } from '@prisma/client';
import { customAlphabet, nanoid } from 'nanoid';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';

@Injectable()
export class OtpService {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async createOTP(employeeId: string) {
    const nanoidNumbers = customAlphabet('0123456789', 6);
    const OTP = nanoidNumbers();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    return await this.prismaService.client.otp.create({
      data: {
        code: OTP,
        expiresAt,
        employeeId,
      },
    });
  }

  async markOtpAsUsed(otp: string) {
    const otpRecord = await this.prismaService.client.otp.findUnique({
      where: { code: otp },
    });
    if (otpRecord) {
      await this.prismaService.client.otp.update({
        where: { code: otp },
        data: { used: true },
      });
    }
  }

  async validateOTP(code: string): Promise<Otp | null> {
    const otp = await this.prismaService.client.otp.findUnique({
      where: { code, used: false },
    });
    if (!otp) {
      console.error('OTP not found');
      return null;
    }
    if (otp.expiresAt < new Date()) {
      console.error('OTP has expired');
      return null;
    }
    return otp;
  }
}
