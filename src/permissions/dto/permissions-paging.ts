import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'lib/dto/paging.dto';
import { PermissionDto } from 'prisma/src/generated/dto/permission.dto';

export class PermissionPagingResultDto {
  @ApiProperty({ type: PermissionDto, isArray: true })
  data: PermissionDto[];

  @ApiProperty({ type: PagingDto })
  meta: PagingDto;
}
