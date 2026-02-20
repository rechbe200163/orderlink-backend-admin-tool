import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/health')
  @HttpCode(HttpStatus.OK)
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
