import { IsNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto extends CreateUserDto {
  @IsNumber()
  @ApiProperty({
    description: 'User id',
    example: 102,
  })
  readonly id: string;
}
