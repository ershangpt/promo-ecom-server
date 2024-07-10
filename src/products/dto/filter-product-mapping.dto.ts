import { ApiProperty } from '@nestjs/swagger';

export class FilterProductMappingDto {
  @ApiProperty()
  genderId?: number;

  @ApiProperty()
  categoryId?: number;

  @ApiProperty()
  baseCategoryId?: number;
}
