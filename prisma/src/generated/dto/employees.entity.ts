
import {Role} from './role.entity'


export class Employees {
  employeeId: string ;
email: string ;
password: string ;
firstName: string ;
lastName: string ;
deleted: boolean ;
Role?: Role  | null;
role: string  | null;
}
