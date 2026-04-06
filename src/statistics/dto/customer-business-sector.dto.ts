import { ApiProperty } from '@nestjs/swagger';
import { BusinessSector } from '@generated/tenant/client';

export class CustomerBusinessSectorDto {
  @ApiProperty()
  totalCustomers: number;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  sectors: Record<BusinessSector, number>;
}
