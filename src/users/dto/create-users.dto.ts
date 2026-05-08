import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El username debe ser texto' })
  @IsNotEmpty({ message: 'El username es obligatorio' })
  @MaxLength(50, { message: 'El username no debe superar 50 caracteres' })
  username: string;

  @IsString({ message: 'El primer nombre debe ser texto' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @MaxLength(80, { message: 'El primer nombre no debe superar 80 caracteres' })
  first_name: string;

  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser texto' })
  @MaxLength(80, { message: 'El segundo nombre no debe superar 80 caracteres' })
  second_name?: string;

  @IsString({ message: 'El primer apellido debe ser texto' })
  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @MaxLength(80, { message: 'El primer apellido no debe superar 80 caracteres' })
  first_lastname: string;

  @IsOptional()
  @IsString({ message: 'El segundo apellido debe ser texto' })
  @MaxLength(80, { message: 'El segundo apellido no debe superar 80 caracteres' })
  second_lastname?: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(150, { message: 'El email no debe superar 150 caracteres' })
  email: string;

  @IsString({ message: 'La password debe ser texto' })
  @IsNotEmpty({ message: 'La password es obligatoria' })
  @MinLength(6, { message: 'La password debe tener al menos 6 caracteres' })
  @MaxLength(100, { message: 'La password no debe superar 100 caracteres' })
  password: string;

  @IsString({ message: 'El role debe ser texto' })
  @IsNotEmpty({ message: 'El role es obligatorio' })
  @IsIn(['SUP', 'ADM', 'OPR', 'CLI', 'SPT'], {
    message: 'El role debe ser SUP, ADM, OPR, CLI o SPT',
  })
  role: string;
}