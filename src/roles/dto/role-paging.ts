import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'lib/dto/paging.dto';
import { RoleDto } from 'prisma/src/generated/dto/role.dto';

export class RolePagingResultDto {
  @ApiProperty({ type: RoleDto, isArray: true })
  data: RoleDto[];

  @ApiProperty({ type: PagingDto })
  meta: PagingDto;
}
