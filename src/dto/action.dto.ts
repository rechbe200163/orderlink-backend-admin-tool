import { ApiProperty } from '@nestjs/swagger';
import { Actions } from '@prisma/client';

export class ActionDto {
  @ApiProperty({
    enum: Actions,
  })
  name: Actions;
  description: string | null;
  deleted: boolean;
}
