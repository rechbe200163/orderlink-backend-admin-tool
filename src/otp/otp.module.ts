import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';

@Module({
  imports: [DatabaseModule],
  providers: [OtpService, TypedEventEmitterModule],
  exports: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
