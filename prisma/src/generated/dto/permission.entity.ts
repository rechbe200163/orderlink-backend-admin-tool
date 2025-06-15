
import {Actions,Ressources} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Role} from './role.entity'
import {ResourceAction} from './resourceAction.entity'


export class Permission {
  id: string ;
role: string ;
@ApiProperty({
  enum: Actions,
})
action: Actions ;
@ApiProperty({
  enum: Ressources,
})
resource: Ressources ;
Role?: Role ;
resourceAction?: ResourceAction ;
allowed: boolean ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
}
