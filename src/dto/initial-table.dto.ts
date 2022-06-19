import { ApiProperty } from '@nestjs/swagger';

export class InitialTableDto {
  @ApiProperty()
  initialTable: number[][];
}
