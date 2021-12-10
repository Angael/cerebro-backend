import { IsEmail, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @Length(28, 36)
  uid: string;
}
