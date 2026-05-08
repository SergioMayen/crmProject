import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateContactDto {
  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(150, { message: 'Los nombres no deben superar 150 caracteres' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(150, { message: 'Los apellidos no deben superar 150 caracteres' })
  apellidos: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(150, { message: 'El email no debe superar 150 caracteres' })
  email: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(30, { message: 'El teléfono no debe superar 30 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La empresa debe ser texto' })
  @MaxLength(150, { message: 'La empresa no debe superar 150 caracteres' })
  empresa?: string;

  @IsString({ message: 'El estado del pipeline debe ser texto' })
  @IsNotEmpty({ message: 'El estado del pipeline es obligatorio' })
  @IsIn(['CONVERSACION_INICIAL', 'SEGUIMIENTO', 'CONVERSACION_CERRADA'], {
    message:
      'El pipeline_status debe ser CONVERSACION_INICIAL, SEGUIMIENTO o CONVERSACION_CERRADA',
  })
  pipeline_status: string;
}