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
        host: process.env.RESEND_SMTP_HOST,
        port: Number(process.env.RESEND_SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.RESEND_SMTP_USERNAME,
          pass: process.env.RESEND_API_KEY,
        },
      },
      defaults: {
        from: process.env.RESEND_FROM_EMAIL,
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
