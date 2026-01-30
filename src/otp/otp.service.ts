import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Otp, Prisma } from '@prisma/client';
import { customAlphabet, nanoid } from 'nanoid';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';

@Injectable()
export class OtpService {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly eventEmitter: TypedEventEmitter, // Assuming you have a TypedEventEmitter for event handling
  ) {}

  async createOTP(employeeId: string) {
    const nanoidNumbers = customAlphabet('0123456789', 8);
    const OTP = Number(nanoidNumbers());
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    return await this.prismaService.client.otp.create({
      data: {
        code: OTP,
        expiresAt,
        employeeId,
      },
    });
  }

  async markOtpAsUsed(otp: number) {
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

  async validateOTP(code: number): Promise<Otp | null> {
    const otp = await this.prismaService.client.otp.findUnique({
      where: { code, used: false },
    });
    if (!otp) {
      return null;
    }
    if (otp.expiresAt < new Date()) {
      return null;
    }
    return otp;
  }

  async resendOtp(employeeId: string) {
    const otp = await this.createOTP(employeeId);
    // Here you would typically send the OTP via email or SMS
    this.eventEmitter.emit('otp.resend', {
      employeeId,
      otpCode: otp.code,
    });
    return {
      message: 'OTP resent successfully',
      otpCode: otp.id,
    };
  }
}
