import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({
    type: `string`,
    description: `The name of the route`,
  })
  name: string;
}
