
import {Employees} from './employees.entity'
import {Permission} from './permission.entity'


export class Role {
  name: string ;
description: string  | null;
deleted: boolean ;
employees?: Employees[] ;
permissions?: Permission[] ;
}
