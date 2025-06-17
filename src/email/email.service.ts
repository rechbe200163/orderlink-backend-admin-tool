import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('customer.created')
  async welcomeEmail(data: EventPayloads['customer.created']) {
    const { email, firstName, lastName, password } = data;

    console.log(
      `Sending welcome email to ${email} with firstName: ${firstName}`,
      `with lastName: ${lastName}`,
      `with password: ${password}`,
    );

    await this.mailerService.sendMail({
      to: email,
      template: './created',
      context: {
        firstName,
        lastName,
        email,
        password,
      },
    });
  }
}
