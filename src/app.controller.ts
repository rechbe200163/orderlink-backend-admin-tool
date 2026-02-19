import { Controller } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  ping() {
    return 200;
  }
}
