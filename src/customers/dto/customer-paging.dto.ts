import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from 'lib/dto/paging.dto';
import { CustomerDto } from 'src/customers/dto/customer.dto';

export class CustomerPagingResultDto {
  @ApiProperty({ type: CustomerDto, isArray: true })
  data: CustomerDto[];

  @ApiProperty({ type: PagingDto })
  meta: PagingDto;
}
