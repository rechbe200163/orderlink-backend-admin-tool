
import {Ressources} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class RessourceDto {
  @ApiProperty({
  enum: Ressources,
})
name: Ressources ;
description: string  | null;
deleted: boolean ;
}
