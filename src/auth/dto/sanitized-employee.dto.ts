// employee/dto/sanitized-employee.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SanitizedEmployeeDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ type: String })
  role: string;

  @ApiProperty()
  superAdmin: boolean;
}
