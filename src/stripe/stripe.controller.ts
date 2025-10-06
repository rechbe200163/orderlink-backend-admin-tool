import {
  Body,
  Controller,
  Post,
  RawBodyRequest,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { requireTenantId } from 'lib/common/tenant.util';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('stripe')
@UseGuards(JwtAuthGuard)
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @ApiBody({
    description: 'Stripe checkout session information',
    type: CreateCheckoutSessionDto,
    required: true,
  })
  @Post('checkout')
  async startCheckout(@Request() req, @Body() body: CreateCheckoutSessionDto) {
    const { tenantId, email } = requireTenantId(req);
    return this.stripeService.createCheckoutSession({
      ...body,
      tenantId,
      email,
    });
  }

  @Post('webhook')
  async handleStripeWebhook(@Request() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody as Buffer;
    await this.stripeService.processWebhook(rawBody, signature);
    return { received: true };
  }
}
