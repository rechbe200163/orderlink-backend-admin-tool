import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/health')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
