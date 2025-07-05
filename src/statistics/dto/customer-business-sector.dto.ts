import { ApiProperty } from '@nestjs/swagger';
import { BusinessSector } from '@prisma/client';

export class CustomerBusinessSectorDto {
  @ApiProperty()
  totalCustomers: number;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  sectors: Record<BusinessSector, number>;
}
