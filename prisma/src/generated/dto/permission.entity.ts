
import { Actions } from '@prisma/client';
import { Resources } from '../../../src/rbac/resources.enum';
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
  enum: Resources,
})
resource: Resources ;
Role?: Role ;
resourceAction?: ResourceAction ;
allowed: boolean ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
}
