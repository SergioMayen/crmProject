import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInteractionDto {
  @Type(() => Number)
  @IsInt({ message: 'El contact_id debe ser un número entero' })
  @Min(1, { message: 'El contact_id debe ser mayor a 0' })
  contact_id: number;

  @IsString({ message: 'El tipo de interacción debe ser texto' })
  @IsNotEmpty({ message: 'El tipo de interacción es obligatorio' })
  @IsIn(['LLAMADA', 'EMAIL', 'WHATSAPP', 'REUNION'], {
    message: 'El interaction_type debe ser LLAMADA, EMAIL, WHATSAPP o REUNION',
  })
  interaction_type: string;

  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, { message: 'La descripción no debe superar 500 caracteres' })
  descripcion: string;

  @Type(() => Number)
  @IsInt({ message: 'El created_by debe ser un número entero' })
  @Min(1, { message: 'El created_by debe ser mayor a 0' })
  created_by: number;
}