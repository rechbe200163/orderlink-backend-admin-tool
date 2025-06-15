
import {ApiProperty} from '@nestjs/swagger'


export class PermissionDto {
  id: string ;
allowed: boolean ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
}
