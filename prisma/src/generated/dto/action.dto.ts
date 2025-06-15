
import {Actions} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class ActionDto {
  @ApiProperty({
  enum: Actions,
})
name: Actions ;
description: string  | null;
deleted: boolean ;
}
