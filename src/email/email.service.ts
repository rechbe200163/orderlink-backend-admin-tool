import { OtpService } from './../otp/otp.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmployeesRepository } from 'src/employees/employees.repository';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly employeeRepository: EmployeesRepository,
    private readonly OtpService: OtpService,
  ) {}

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

  @OnEvent('employee.created')
  async employeeCreatedEmail(data: EventPayloads['employee.created']) {
    const { email, firstName, lastName, password, employeeId } = data;

    console.log(
      `Sending employee created email to ${email} with firstName: ${firstName}`,
      `with lastName: ${lastName}`,
      `with password: ${password}`,
    );

    const otp = await this.OtpService.createOTP(employeeId);

    await this.mailerService.sendMail({
      to: email,
      template: './employee-created',
      context: {
        firstName,
        lastName,
        email,
        password,
        otp,
      },
    });
  }

  @OnEvent('access-violation')
  async accessViolationEmail(data: EventPayloads['access-violation']) {
    // find all employees with admin role
    const adminEmails = await this.employeeRepository.findAdminEmails();

    const { employeeId, firstName, lastName, email, role, resource, action } =
      data;

    console.log(
      `Sending access violation email for employeeId: ${employeeId}, firstName: ${firstName}`,
      `lastName: ${lastName}, email: ${email}, role: ${role}, resource: ${resource}, action: ${action}`,
    );

    for (const adminEmail of adminEmails) {
      await this.mailerService.sendMail({
        to: adminEmail,
        template: './access-violation',
        context: {
          employeeId,
          firstName,
          lastName,
          email,
          role,
          resource,
          action,
        },
      });
    }
  }

  @OnEvent('permission.requested')
  async permissionRequestEmail(data: EventPayloads['permission.requested']) {
    const adminEmails = await this.employeeRepository.findAdminEmails();
    const { employeeId, role, resource, actions } = data;

    for (const adminEmail of adminEmails) {
      await this.mailerService.sendMail({
        to: adminEmail,
        template: './access-violation',
        context: { employeeId, role, resource, actions },
      });
    }
  }
}
