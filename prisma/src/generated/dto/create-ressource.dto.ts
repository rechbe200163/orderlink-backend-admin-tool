
import {Ressources} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateRessourceDto {
  @ApiProperty({
  enum: Ressources,
})
name: Ressources;
description?: string;
}
