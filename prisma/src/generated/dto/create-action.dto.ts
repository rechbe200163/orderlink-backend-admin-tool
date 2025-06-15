
import {Actions} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateActionDto {
  @ApiProperty({
  enum: Actions,
})
name: Actions;
description?: string;
}
