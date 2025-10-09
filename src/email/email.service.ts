import { OtpService } from '../otp/otp.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmployeesRepository } from 'src/employees/employees.repository';
import { EventPayloads } from 'src/event-emitter/interface/event-types.interface';
import { Resend } from 'resend';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  private readonly companyName = process.env.COMPANY_NAME ?? 'OrderLink';
  private readonly fromEmail = process.env.RESEND_FROM_EMAIL;
  private readonly magicLinkBaseUrl =
    process.env.MAGIC_LINK_BASE_URL ?? 'https://admin.orderlink.at/auth';
  private readonly changePasswordUrl =
    process.env.CHANGE_PASSWORD_URL ??
    'https://admin.orderlink.at/account/change-password';

  constructor(
    private readonly resend: Resend,
    private readonly employeeRepository: EmployeesRepository,
    private readonly OtpService: OtpService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @OnEvent('customer.created')
  async welcomeEmail(data: EventPayloads['customer.created']) {
    const { email, firstName, lastName, password } = data;

    console.log(
      `Sending welcome email to ${email} with firstName: ${firstName}`,
      `with lastName: ${lastName}`,
      `with password: ${password}`,
    );

    await this.sendEmail({
      to: email,
      subject: `Willkommen bei ${this.companyName}`,
      template: 'created',
      context: {
        firstName,
        lastName,
        email,
        password,
        changePasswordUrl: this.changePasswordUrl,
      },
    });
  }

  @OnEvent('employee.created')
  async employeeCreatedEmail(data: EventPayloads['employee.created']) {
    const { tenant, email, firstName, lastName, employeeId } = data;

    console.log(
      `Sending employee created email to ${email} with firstName: ${firstName}`,
      `with lastName: ${lastName}`,
    );

    const { code } = await this.OtpService.createOTP(
      tenant.tenantId,
      employeeId,
    );

    const magicLink = `${this.magicLinkBaseUrl}/${tenant.tenantSlug}/otp`;

    await this.sendEmail({
      to: email,
      subject: `Ihr Mitarbeiterzugang fuer ${this.companyName}`,
      template: 'employee-created',
      context: {
        firstName,
        lastName,
        email,
        otp: code,
        magicLink,
      },
    });
  }

  @OnEvent('access-violation')
  async accessViolationEmail(data: EventPayloads['access-violation']) {
    // find all employees with admin role
    const {
      tenantId,
      employeeId,
      firstName,
      lastName,
      email,
      role,
      resource,
      action,
    } = data;
    const adminEmails = await this.employeeRepository.findAdminEmails(tenantId);

    console.log(
      `Sending access violation email for employeeId: ${employeeId}, firstName: ${firstName}`,
      `lastName: ${lastName}, email: ${email}, role: ${role}, resource: ${resource}, action: ${action}`,
    );

    if (!adminEmails.length) {
      return;
    }

    await this.sendEmail({
      to: adminEmails,
      subject: `Zugriffsverletzung im Mandanten ${tenantId}`,
      template: 'access-violation',
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

  @OnEvent('permission.requested')
  async permissionRequestEmail(data: EventPayloads['permission.requested']) {
    const { tenantId, employeeId, role, resource, actions } = data;
    const adminEmails = await this.employeeRepository.findAdminEmails(tenantId);

    if (!adminEmails.length) {
      return;
    }

    await this.sendEmail({
      to: adminEmails,
      subject: `Neue Berechtigungsanfrage fuer ${resource}`,
      template: 'permission-request',
      context: { employeeId, role, resource, actions: actions.join(', ') },
    });
  }

  @OnEvent('otp.resend')
  async resendOtpEmail(data: EventPayloads['otp.resend']) {
    const { tenantId, employeeId, otpCode } = data;

    const employee = await this.employeeRepository.findById(
      tenantId,
      employeeId,
    );
    if (!employee) {
      console.error(`Employee with ID ${employeeId} not found`);
      return;
    }

    console.log(
      `Resending OTP to ${employee.email} for employeeId: ${employeeId}`,
    );

    await this.sendEmail({
      to: employee.email,
      subject: `Ihr Einmal-Code fuer ${this.companyName}`,
      template: 'otp-resend',
      context: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        otpCode,
      },
    });
  }

  private async sendEmail({
    to,
    subject,
    template,
    context,
  }: {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, string | number | undefined>;
  }) {
    if (!this.fromEmail) {
      throw new Error('RESEND_FROM_EMAIL environment variable is not set');
    }

    const html = await this.emailTemplateService.render(template, {
      ...context,
      companyName: this.companyName,
      currentYear: new Date().getFullYear(),
    });

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }
}

