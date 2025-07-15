import { Type } from 'class-transformer';
// auth/dto/auth-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SanitizedEmployeeDto } from './sanitized-employee.dto';
import { TokenDto } from './token.dto';

export class AuthResultDto {
  @ApiProperty({ type: TokenDto })
  token: TokenDto;

  @ApiProperty({ type: SanitizedEmployeeDto })
  user: SanitizedEmployeeDto;
}
