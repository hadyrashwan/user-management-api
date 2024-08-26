import { IsEmail, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  readonly email: string;

  readonly id?: number;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  readonly first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  readonly last_name: string;

  @ApiProperty({
    description: "The URL of the user's avatar image",
    example: 'https://example.com/avatar.png',
  })
  @IsString()
  @IsUrl()
  readonly avatar: string;
}
