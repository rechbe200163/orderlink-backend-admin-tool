import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmployeesModule } from 'src/employees/employees.module';
import { OtpModule } from 'src/otp/otp.module';
import { EmailTemplateService } from './email-template.service';
import { Resend } from 'resend';

@Module({
  imports: [EmployeesModule, OtpModule],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailTemplateService,
    {
      provide: Resend,
      useFactory: () => {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
          throw new Error('RESEND_API_KEY environment variable is not set');
        }

        return new Resend(apiKey);
      },
    },
  ],
})
export class EmailModule {}
