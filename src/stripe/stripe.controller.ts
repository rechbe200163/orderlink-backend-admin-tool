import { Body, Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller('billing')
export class StripeController {
  constructor(private readonly billingService: StripeService) {}

  @ApiBody({
    description: 'Billing information for checkout session',
    type: CreateCheckoutSessionDto,
    required: true,
  })
  @Post('checkout')
  async startCheckout(@Body() body: CreateCheckoutSessionDto) {
    console.log('Starting checkout session:', body);
    return this.billingService.createCheckoutSession(body);
  }

  @Post('webhook')
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody as Buffer;
    await this.billingService.processWebhook(rawBody, signature);
    return { received: true };
  }
}
