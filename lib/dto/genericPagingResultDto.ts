import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'lib/dto/paging.dto';

export class PagingResultDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: PagingDto })
  meta: PagingDto;
}
