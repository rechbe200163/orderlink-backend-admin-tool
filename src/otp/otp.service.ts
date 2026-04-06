import { Inject, Injectable } from '@nestjs/common';
import { Otp } from '@generated/tenant/client';

import { customAlphabet } from 'nanoid';

import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { TenantDbContext } from 'lib/tenant-db-context';

@Injectable()
export class OtpService {
  constructor(
    // ✅ use `ExtendedPrismaClient` type for correct type-safety of your extended PrismaClient
    private readonly db: TenantDbContext,
    private readonly eventEmitter: TypedEventEmitter, // Assuming you have a TypedEventEmitter for event handling
  ) {}

  async createOTP(employeeId: string) {
    const nanoidNumbers = customAlphabet('0123456789', 8);
    const OTP = Number(nanoidNumbers());
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    return await this.db.prisma.otp.create({
      data: {
        code: OTP,
        expiresAt,
        employeeId,
      },
    });
  }

  async markOtpAsUsed(otp: number) {
    const otpRecord = await this.db.prisma.otp.findUnique({
      where: { code: otp },
    });
    if (otpRecord) {
      await this.db.prisma.otp.update({
        where: { code: otp },
        data: { used: true },
      });
    }
  }

  async validateOTP(code: number): Promise<Otp | null> {
    const otp = await this.db.prisma.otp.findUnique({
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
