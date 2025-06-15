
import {Actions} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {ResourceAction} from './resourceAction.entity'


export class Action {
  @ApiProperty({
  enum: Actions,
})
name: Actions ;
description: string  | null;
deleted: boolean ;
resourceLinks?: ResourceAction[] ;
}
