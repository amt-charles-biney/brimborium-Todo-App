import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 255)
  password: string;
}
