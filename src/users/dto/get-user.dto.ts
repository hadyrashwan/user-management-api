import { IsNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class GetUserDto extends CreateUserDto {
  @IsNumber()
  readonly id: string;
}
