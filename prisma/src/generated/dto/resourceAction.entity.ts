import { Actions } from "@prisma/client";
import { Resources } from "../../../src/rbac/resources.enum";
import {ApiProperty} from '@nestjs/swagger'
import {Action} from './action.entity'
import { Resource } from './resource.entity'
import {Permission} from './permission.entity'


export class ResourceAction {
  @ApiProperty({
  enum: Actions,
})
action: Actions ;
@ApiProperty({
  enum: Resources,
})
resource: Resources ;
Action?: Action ;
Resource?: Resource ;
permissions?: Permission[] ;
}
