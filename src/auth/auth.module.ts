import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { EmployeesModule } from 'src/employees/employees.module';
import { TypedEventEmitterModule } from 'src/event-emitter/event-emitter.module';
import { OtpModule } from 'src/otp/otp.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    DatabaseModule,
    TypedEventEmitterModule,
    EmployeesModule,
    JwtModule.register({
      global: true,
      secret: process.env.PRODUCTION
        ? process.env.JWT_SECRET
        : 'your_jwt_secret_here',
      signOptions: { expiresIn: '1h' },
    }),
    OtpModule,
    PassportModule,
    EmployeesModule,
  ],
})
export class AuthModule {}
