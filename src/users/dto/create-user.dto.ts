import { IsEmail, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  readonly email: string;
  @IsString()
  readonly first_name: string;
  @IsString()
  readonly last_name: string;
  @IsString()
  @IsUrl()
  readonly avatar: string;
}
