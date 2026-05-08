import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El usuario debe ser texto' })
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @MaxLength(50, { message: 'El usuario no debe superar 50 caracteres' })
  username: string;

  @IsString({ message: 'La password debe ser texto' })
  @IsNotEmpty({ message: 'La password es obligatoria' })
  @MaxLength(100, { message: 'La password no debe superar 100 caracteres' })
  password: string;
}