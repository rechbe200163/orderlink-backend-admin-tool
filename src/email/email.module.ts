import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EmployeesModule } from 'src/employees/employees.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
      template: {
        dir: join(__dirname, '../../email/templates'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    EmployeesModule,
    OtpModule,
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
