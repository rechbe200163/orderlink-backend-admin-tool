import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('')
  getProfile(@Request() req) {
    return {
      message: 'Welcome to the Order Link Backend API',
      status: 'success',
      docs: 'visit /docs for more information',
    };
  }
}
