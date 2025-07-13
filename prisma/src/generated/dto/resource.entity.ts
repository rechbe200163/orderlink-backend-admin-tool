import { Resources } from "../../../src/rbac/resources.enum";
import {ApiProperty} from '@nestjs/swagger'
import {ResourceAction} from './resourceAction.entity'


export class Resource {
  @ApiProperty({
    enum: Resources,
  })
  name: Resources;
description: string  | null;
deleted: boolean ;
actionLinks?: ResourceAction[] ;
}
