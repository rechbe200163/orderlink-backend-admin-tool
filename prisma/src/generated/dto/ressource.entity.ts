
import {Ressources} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {ResourceAction} from './resourceAction.entity'


export class Ressource {
  @ApiProperty({
  enum: Ressources,
})
name: Ressources ;
description: string  | null;
deleted: boolean ;
actionLinks?: ResourceAction[] ;
}
