// auth/dto/auth-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SanitizedEmployeeDto } from './sanitized-employee.dto';

export class AuthResultDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: SanitizedEmployeeDto })
  user: SanitizedEmployeeDto;
}
