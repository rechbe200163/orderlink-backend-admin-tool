import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';

@Module({
  providers: [OtpService, TypedEventEmitterModule],
  exports: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
