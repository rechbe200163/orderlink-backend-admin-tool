// employee/dto/sanitized-employee.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class SanitizedEmployeeDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  superAdmin: boolean;
}
