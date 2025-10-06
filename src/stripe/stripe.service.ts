import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  ModuleName,
  UserTier,
  calculateOrderLinkPricing,
  modulePrices,
  setupFee,
  userPrices,
} from './stripe.utils';
import { read } from 'fs';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'prisma/prisma.extension';
import { ModuleEnum, TenantStatus } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });
  }

  async processWebhook(payload: Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      secret,
    );
    await this.handleStripeEvent(event);
  }

  private async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(
          `Stripe checkout completed for session ${session.id}, customer ${session.customer}, total: ${session.amount_total}, currency: ${session.currency}, session: ${JSON.stringify(session)}`,
        );

        const tenantId = session.metadata?.tenantId;
        const modules = session.metadata?.modules
          ? (session.metadata.modules.split(',') as ModuleName[])
          : [];
        const userTier =
          (session.metadata?.userTier as UserTier) || UserTier.CORE;

        if (session.metadata) {
          this.prismaService.client.tenant.update({
            where: { tenantId },
            data: {
              status: TenantStatus.ACTIVE,
              billingCustomerId: session.customer as string,
              maxEmployees:
                userTier === UserTier.CORE
                  ? 3
                  : userTier === UserTier.TEAM
                    ? 5
                    : userTier === UserTier.PRO
                      ? 7
                      : 3,
              enabledModules: {
                set:
                  modules.map((m) => ({
                    tenantId_moduleName: {
                      tenantId: tenantId as string,
                      moduleName: ModuleEnum[m],
                    },
                  })) || [],
              },
            },
          });
          console.log(
            `Update tenant ${tenantId} with modules ${modules} and userTier ${userTier}`,
          );
        }

        break;
      }
      default:
        console.log(`Unhandled stripe event ${event.type}`);
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
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Setup Fee (einmalig)
    line_items.push({
      price_data: {
        currency: 'eur',
        unit_amount: setupFee * 100,
        product_data: {
          name: 'Einrichtungsgebühr',
          description: 'Einmalige Setup-Kosten für OrderLink',
        },
      },
      quantity: 1,
    });

    // Module (monatlich)
    (modules ?? []).forEach((mod) => {
      line_items.push({
        price_data: {
          currency: 'eur',
          unit_amount: modulePrices[mod] * 100,
          recurring: { interval: 'month' },
          product_data: {
            name: `Modul: ${mod}`,
            description: `Monatliche Kosten für das Modul "${mod}"`,
          },
        },
        quantity: 1,
      });
    });

    // Nutzergruppe (monatlich)
    if (userTier && userPrices[userTier] > 0) {
      line_items.push({
        price_data: {
          currency: 'eur',
          unit_amount: userPrices[userTier] * 100,
          recurring: { interval: 'month' },
          product_data: {
            name: `Nutzergruppe: ${userTier}`,
            description: `Bis zu ${userTier === 'TEAM' ? 5 : userTier === 'PRO' ? 7 : 'Nutzer'} Nutzer`,
          },
        },
        quantity: 1,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'revolut_pay'],
      mode: 'subscription',
      customer_email: email,
      line_items,
      metadata: {
        modules: modules ? modules.join(',') : '',
        userTier: userTier || 'FREE',
        tenantId,
      },
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return { url: session.url };
  }
}
