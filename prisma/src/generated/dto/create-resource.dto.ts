import { Resources } from '../../../src/rbac/resources.enum';
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateResourceDto {
  @ApiProperty({
    enum: Resources,
  })
  name: Resources;
  description?: string;
}
