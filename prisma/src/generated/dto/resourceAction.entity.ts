
import {Actions,Ressources} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Action} from './action.entity'
import {Ressource} from './ressource.entity'
import {Permission} from './permission.entity'


export class ResourceAction {
  @ApiProperty({
  enum: Actions,
})
action: Actions ;
@ApiProperty({
  enum: Ressources,
})
resource: Ressources ;
Action?: Action ;
Ressource?: Ressource ;
permissions?: Permission[] ;
}
