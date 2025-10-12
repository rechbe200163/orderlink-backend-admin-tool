import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ModuleEnum, TenantStatus } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { AddressDto } from 'prisma/src/generated/dto/address.dto';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import Stripe from 'stripe';
import {
  ModuleName,
  UserTier,
  modulePrices,
  setupFee,
  userPrices,
} from './stripe.utils';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly moduleNameToEnum: Record<ModuleName, ModuleEnum> = {
    [ModuleName.ACCESS]: ModuleEnum.CUSTOM_ROLES,
    [ModuleName.INSIGHT]: ModuleEnum.STATISTICS,
    [ModuleName.FLOW]: ModuleEnum.NAVIGATION,
  };
  private readonly maxEmployeesByTier: Record<UserTier, number> = {
    [UserTier.CORE]: 3,
    [UserTier.TEAM]: 5,
    [UserTier.PRO]: 7,
    [UserTier.ENTERPRISE]: 10,
  };

  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerErrorException(
        'Stripe secret key is not configured',
      );
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });
  }

  async processWebhook(payload: Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      this.logger.error('Missing STRIPE_WEBHOOK_SECRET configuration');
      throw new InternalServerErrorException(
        'Stripe webhook secret is not configured',
      );
    }

    if (!signature) {
      this.logger.warn('Received Stripe webhook request without signature');
      throw new BadRequestException('Missing Stripe signature header');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to verify Stripe webhook signature: ${err.message}`,
        err.stack,
      );
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    await this.handleStripeEvent(event);
  }

  private async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session?.metadata) {
          this.logger.warn(
            `Checkout session ${session?.id} completed without metadata`,
          );
          return;
        }

        const tenantId = session.metadata.tenantId;
        if (!tenantId) {
          this.logger.warn(
            `Checkout session ${session.id} missing tenantId metadata`,
          );
          return;
        }

        const rawModules = session.metadata.modules
          ? session.metadata.modules
              .split(',')
              .map((m) => m.trim())
              .filter(Boolean)
          : [];

        const modules = Array.from(
          new Set(
            rawModules.filter((module): module is ModuleName =>
              Object.values(ModuleName).includes(module as ModuleName),
            ),
          ),
        );

        const invalidModules = rawModules.filter(
          (module) => !Object.values(ModuleName).includes(module as ModuleName),
        );
        if (invalidModules.length) {
          this.logger.warn(
            `Checkout session ${session.id} contains unknown modules: ${invalidModules.join(', ')}`,
          );
        }

        const duplicateModules = rawModules.filter(
          (module, index, array) => array.indexOf(module) !== index,
        );
        if (duplicateModules.length) {
          this.logger.warn(
            `Checkout session ${session.id} contains duplicate modules: ${Array.from(new Set(duplicateModules)).join(', ')}`,
          );
        }

        const userTier =
          (session.metadata.userTier as UserTier | undefined) ?? UserTier.CORE;

        const stripeCustomerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;

        if (!stripeCustomerId) {
          this.logger.warn(
            `Checkout session ${session.id} missing customer identifier`,
          );
          return;
        }

        const unmappedModules = modules.filter(
          (module) => !this.moduleNameToEnum[module],
        );
        if (unmappedModules.length) {
          this.logger.warn(
            `No ModuleEnum mapping found for modules: ${unmappedModules.join(', ')}`,
          );
        }

        const enabledModules = modules
          .map((module) => this.moduleNameToEnum[module])
          .filter(
            (moduleEnum): moduleEnum is ModuleEnum =>
              moduleEnum !== undefined && moduleEnum !== null,
          );

        try {
          await this.prismaService.client.tenant.update({
            where: { tenantId },
            data: {
              status: TenantStatus.ACTIVE,
              stripeCustomerId,
              maxEmployees:
                this.maxEmployeesByTier[userTier] ??
                this.maxEmployeesByTier[UserTier.CORE],
              enabledModules: {
                set: enabledModules.map((moduleName) => ({
                  tenantId_moduleName: {
                    tenantId,
                    moduleName,
                  },
                })),
              },
            },
          });
          this.logger.log(
            `Updated tenant ${tenantId} after checkout session ${session.id}`,
          );
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            `Failed to update tenant ${tenantId} after checkout session ${session.id}: ${err.message}`,
            err.stack,
          );
        }

        break;
      }
      default:
        this.logger.debug(`Unhandled stripe event ${event.type}`);
    }
  }

  async createCheckoutSession({
    tenantId,
    modules,
    userTier,
    email,
  }: {
    tenantId: string;
    modules?: ModuleName[];
    userTier?: UserTier;
    email: string;
  }) {
    if (!tenantId) {
      throw new BadRequestException('Tenant identifier is required');
    }

    if (!email) {
      throw new BadRequestException('Email address is required');
    }

    const tenant = await this.prismaService.client.tenant.findUnique({
      where: { tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} was not found`);
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new InternalServerErrorException(
        'Frontend URL is not configured (FRONTEND_URL)',
      );
    }

    const sanitizedModules = Array.from(
      new Set(
        (modules ?? []).filter((module): module is ModuleName =>
          Object.values(ModuleName).includes(module),
        ),
      ),
    );

    if ((modules?.length ?? 0) !== sanitizedModules.length) {
      this.logger.warn(
        `Checkout session request for tenant ${tenantId} contained invalid or duplicate modules: ${(modules ?? []).join(', ')}`,
      );
    }

    const normalizedTier = userTier ?? UserTier.CORE;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (setupFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          unit_amount: setupFee * 100,
          product_data: {
            name: 'Einrichtungsgebuehr',
            description: 'Einmalige Setup-Kosten fuer OrderLink',
          },
        },
        quantity: 1,
      });
    }

    sanitizedModules.forEach((module) => {
      const modulePrice = modulePrices[module];
      if (modulePrice <= 0) {
        this.logger.warn(
          `Skipping module ${module} for tenant ${tenantId} because price is not configured`,
        );
        return;
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          unit_amount: modulePrice * 100,
          recurring: { interval: 'month' },
          product_data: {
            name: `Modul: ${module}`,
            description: `Monatliche Kosten fuer das Modul "${module}"`,
          },
        },
        quantity: 1,
      });
    });

    const userPrice = userPrices[normalizedTier];
    if (userPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          unit_amount: userPrice * 100,
          recurring: { interval: 'month' },
          product_data: {
            name: `Nutzergruppe: ${normalizedTier}`,
            description: `Bis zu ${this.maxEmployeesByTier[normalizedTier]} Nutzer`,
          },
        },
        quantity: 1,
      });
    }

    if (!lineItems.length) {
      this.logger.error(
        `Attempted to create Stripe checkout session for tenant ${tenantId} without any chargeable items`,
      );
      throw new BadRequestException(
        'No billable line items were generated for the requested checkout session',
      );
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'revolut_pay'],
      mode: 'subscription',
      line_items: lineItems,
      metadata: {
        modules: sanitizedModules.join(','),
        userTier: normalizedTier,
        tenantId,
      },
      success_url: `${frontendUrl}/success`,
      cancel_url: `${frontendUrl}/cancel`,
    };

    if (tenant.stripeCustomerId) {
      sessionParams.customer = tenant.stripeCustomerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return { url: session.url };
  }

  async createPortalSession(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant identifier is required');
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new InternalServerErrorException(
        'Frontend URL is not configured (FRONTEND_URL)',
      );
    }

    const tenant = await this.prismaService.client.tenant.findUnique({
      where: { tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} was not found`);
    }

    if (!tenant.stripeCustomerId) {
      throw new BadRequestException(
        `Tenant ${tenantId} does not have a Stripe customer yet`,
      );
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${frontendUrl}/billing`,
    });

    return { url: session.url };
  }
}
