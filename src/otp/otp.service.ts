import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Otp } from '@prisma/client';
// import { customAlphabet } from 'nanoid'; // Replaced with dynamic import
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

  async createOTP(tenantId: string, employeeId: string): Promise<Otp> {
    const { customAlphabet } = await import('nanoid');
    const nanoidNumbers = customAlphabet('0123456789', 6);
    const OTP = Number(nanoidNumbers());
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    return await this.prismaService.client.otp.create({
      data: {
        code: OTP,
        expiresAt,
        employeeId,
        tenantId,
      },
    });
  }

  async markOtpAsUsed(tenantSlug: string, otp: number): Promise<void> {
    try {
      const { tenantId } =
        await this.prismaService.client.tenant.findUniqueOrThrow({
          where: { slug: tenantSlug },
          select: { tenantId: true },
        });

      const otpRecord = await this.prismaService.client.otp.findUnique({
        where: { otp_tenant_code_unique: { code: otp, tenantId } },
      });
      if (otpRecord) {
        await this.prismaService.client.otp.update({
          where: { otp_tenant_code_unique: { code: otp, tenantId } },
          data: { used: true },
        });
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired OTP.');
    }
  }

  async validateOTP(tenantId: string, code: number): Promise<Otp | null> {
    console.log('Validating OTP:', code);
    const otp = await this.prismaService.client.otp.findUnique({
      where: { otp_tenant_code_unique: { tenantId, code } },
    });
    console.log('Found OTP record:', otp);
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

  async resendOtp(
    tenantId: string,
    employeeId: string,
  ): Promise<{ message: string; otpCode: string }> {
    const otp = await this.createOTP(employeeId, tenantId);
    // Here you would typically send the OTP via email or SMS
    this.eventEmitter.emit('otp.resend', {
      tenantId,
      employeeId,
      otpCode: otp.code,
    });
    return {
      message: 'OTP resent successfully',
      otpCode: otp.id,
    };
  }
}
