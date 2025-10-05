import { Body, Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { requireTenantId } from 'lib/common/tenant.util';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @ApiBody({
    description: 'Stripe checkout session information',
    type: CreateCheckoutSessionDto,
    required: true,
  })
  @Post('checkout')
  async startCheckout(@Req() req, @Body() body: CreateCheckoutSessionDto) {
    console.log('Starting checkout session:', body);
    const { tenantId } = requireTenantId(req);
    return this.stripeService.createCheckoutSession({ ...body, tenantId });
  }

  @Post('webhook')
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody as Buffer;
    await this.stripeService.processWebhook(rawBody, signature);
    return { received: true };
  }
}
