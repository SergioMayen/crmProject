import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { InteractionRow, InteractionHistoryRow, ApiResponse } from 'src/interfaces/api-response.interface';
import { CreateInteractionDto } from './dto/create-interactions.dto';



@Injectable()
export class InteractionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createInteractionDto: CreateInteractionDto,
  ): Promise<ApiResponse<InteractionRow>> {
    try {
      const contactExists = await this.databaseService.query<{ id: number }>(
        `
        SELECT TOP 1 id
        FROM dbo.contacts
        WHERE id = @contact_id
          AND is_active = 1;
        `,
        [
          {
            name: 'contact_id',
            type: sql.Int,
            value: createInteractionDto.contact_id,
          },
        ],
      );

      if (contactExists.length === 0) {
        return {
          success: false,
          message: 'El contacto no existe o está inactivo',
          data: null,
        };
      }

      const userExists = await this.databaseService.query<{ id: number }>(
        `
        SELECT TOP 1 id
        FROM dbo.users
        WHERE id = @created_by
          AND is_active = 1;
        `,
        [
          {
            name: 'created_by',
            type: sql.Int,
            value: createInteractionDto.created_by,
          },
        ],
      );

      if (userExists.length === 0) {
        return {
          success: false,
          message: 'El usuario creador no existe o está inactivo',
          data: null,
        };
      }

      const insertedInteractions =
        await this.databaseService.query<InteractionRow>(
          `
          INSERT INTO dbo.interactions (
            contact_id,
            interaction_type,
            descripcion,
            created_by
          )
          OUTPUT
            INSERTED.id,
            INSERTED.contact_id,
            INSERTED.interaction_type,
            INSERTED.descripcion,
            INSERTED.created_by,
            INSERTED.created_at
          VALUES (
            @contact_id,
            @interaction_type,
            @descripcion,
            @created_by
          );
          `,
          [
            {
              name: 'contact_id',
              type: sql.Int,
              value: createInteractionDto.contact_id,
            },
            {
              name: 'interaction_type',
              type: sql.VarChar(20),
              value: createInteractionDto.interaction_type,
            },
            {
              name: 'descripcion',
              type: sql.NVarChar(500),
              value: createInteractionDto.descripcion.trim(),
            },
            {
              name: 'created_by',
              type: sql.Int,
              value: createInteractionDto.created_by,
            },
          ],
        );

      return {
        success: true,
        message: 'Interacción registrada correctamente',
        data: insertedInteractions[0],
      };
    } catch (error) {
      return {
        success: false,
        message: 'No se pudo registrar la interacción',
        data: null,
      };
    }
  }

  async findHistoryByContact(
    contactIdParam: string,
  ): Promise<ApiResponse<InteractionHistoryRow[]>> {
    const contactId = Number(contactIdParam);

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return {
        success: false,
        message: 'Id de contacto inválido',
        data: null,
      };
    }

    const contactExists = await this.databaseService.query<{ id: number }>(
      `
      SELECT TOP 1 id
      FROM dbo.contacts
      WHERE id = @contact_id
        AND is_active = 1;
      `,
      [{ name: 'contact_id', type: sql.Int, value: contactId }],
    );

    if (contactExists.length === 0) {
      return {
        success: false,
        message: 'El contacto no existe o está inactivo',
        data: null,
      };
    }

    const history = await this.databaseService.query<InteractionHistoryRow>(
      `
      SELECT
        i.id,
        i.contact_id,
        CONCAT(c.nombres, ' ', c.apellidos) AS contact_name,
        i.interaction_type,
        i.descripcion,
        i.created_by,
        u.username AS created_by_username,
        i.created_at
      FROM dbo.interactions i
      INNER JOIN dbo.contacts c ON c.id = i.contact_id
      INNER JOIN dbo.users u ON u.id = i.created_by
      WHERE i.contact_id = @contact_id
      ORDER BY i.created_at DESC;
      `,
      [{ name: 'contact_id', type: sql.Int, value: contactId }],
    );

    return {
      success: true,
      message: 'Historial de interacciones consultado correctamente',
      data: history,
    };
  }
}