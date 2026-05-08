import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { ApiResponse, ContactRow } from 'src/interfaces/api-response.interface';
import { CreateContactDto } from './dto/create-contacts.dto';




@Injectable()
export class ContactsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<ContactRow>> {
    try {
      const insertedContacts = await this.databaseService.query<ContactRow>(
        `
        INSERT INTO dbo.contacts (
          nombres,
          apellidos,
          email,
          telefono,
          empresa,
          pipeline_status
        )
        OUTPUT
          INSERTED.id,
          INSERTED.nombres,
          INSERTED.apellidos,
          INSERTED.email,
          INSERTED.telefono,
          INSERTED.empresa,
          INSERTED.pipeline_status,
          INSERTED.is_active,
          INSERTED.created_at
        VALUES (
          @nombres,
          @apellidos,
          @email,
          @telefono,
          @empresa,
          @pipeline_status
        );
        `,
        [
          {
            name: 'nombres',
            type: sql.NVarChar(150),
            value: createContactDto.nombres.trim(),
          },
          {
            name: 'apellidos',
            type: sql.NVarChar(150),
            value: createContactDto.apellidos.trim(),
          },
          {
            name: 'email',
            type: sql.NVarChar(150),
            value: createContactDto.email.trim().toLowerCase(),
          },
          {
            name: 'telefono',
            type: sql.NVarChar(30),
            value: createContactDto.telefono?.trim() || null,
          },
          {
            name: 'empresa',
            type: sql.NVarChar(150),
            value: createContactDto.empresa?.trim() || null,
          },
          {
            name: 'pipeline_status',
            type: sql.VarChar(40),
            value: createContactDto.pipeline_status,
          },
        ],
      );

      return {
        success: true,
        message: 'Contacto creado correctamente',
        data: insertedContacts[0],
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'No se pudo crear el contacto');
    }
  }

  async update(
    id: string,
    updateContactDto: CreateContactDto,
  ): Promise<ApiResponse<ContactRow>> {
    try {
      const contactId = Number(id);

      if (!Number.isInteger(contactId) || contactId <= 0) {
        return {
          success: false,
          message: 'Id de contacto inválido',
          data: null,
        };
      }

      const duplicatedEmail = await this.databaseService.query<{ id: number }>(
        `
        SELECT TOP 1 id
        FROM dbo.contacts
        WHERE email = @email
          AND id <> @id;
        `,
        [
          { name: 'email', type: sql.NVarChar(150), value: updateContactDto.email.trim().toLowerCase() },
          { name: 'id', type: sql.Int, value: contactId },
        ],
      );

      if (duplicatedEmail.length > 0) {
        return {
          success: false,
          message: 'Ya existe otro contacto con el mismo email',
          data: null,
        };
      }

      const updatedContacts = await this.databaseService.query<ContactRow>(
        `
        UPDATE dbo.contacts
        SET
          nombres = @nombres,
          apellidos = @apellidos,
          email = @email,
          telefono = @telefono,
          empresa = @empresa,
          pipeline_status = @pipeline_status
        WHERE id = @id
          AND is_active = 1;

        SELECT
          id,
          nombres,
          apellidos,
          email,
          telefono,
          empresa,
          pipeline_status,
          is_active,
          created_at
        FROM dbo.contacts
        WHERE id = @id
          AND is_active = 1;
        `,
        [
          { name: 'id', type: sql.Int, value: contactId },
          {
            name: 'nombres',
            type: sql.NVarChar(150),
            value: updateContactDto.nombres.trim(),
          },
          {
            name: 'apellidos',
            type: sql.NVarChar(150),
            value: updateContactDto.apellidos.trim(),
          },
          {
            name: 'email',
            type: sql.NVarChar(150),
            value: updateContactDto.email.trim().toLowerCase(),
          },
          {
            name: 'telefono',
            type: sql.NVarChar(30),
            value: updateContactDto.telefono?.trim() || null,
          },
          {
            name: 'empresa',
            type: sql.NVarChar(150),
            value: updateContactDto.empresa?.trim() || null,
          },
          {
            name: 'pipeline_status',
            type: sql.VarChar(40),
            value: updateContactDto.pipeline_status,
          },
        ],
      );

      if (updatedContacts.length === 0) {
        return {
          success: false,
          message: 'Contacto no encontrado o inactivo',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Contacto actualizado correctamente',
        data: updatedContacts[0],
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'No se pudo actualizar el contacto');
    }
  }

  async search(search?: string): Promise<ApiResponse<ContactRow[]>> {
    const value = search?.trim();

    if (!value) {
      const contacts = await this.databaseService.query<ContactRow>(
        `
        SELECT
          id,
          nombres,
          apellidos,
          email,
          telefono,
          empresa,
          pipeline_status,
          is_active,
          created_at
        FROM dbo.contacts
        WHERE is_active = 1
        ORDER BY created_at DESC;
        `,
      );

      return {
        success: true,
        message: 'Contactos consultados correctamente',
        data: contacts,
      };
    }

    const contacts = await this.databaseService.query<ContactRow>(
      `
      SELECT
        id,
        nombres,
        apellidos,
        email,
        telefono,
        empresa,
        pipeline_status,
        is_active,
        created_at
      FROM dbo.contacts
      WHERE is_active = 1
        AND (
          nombres LIKE @search
          OR apellidos LIKE @search
          OR email LIKE @search
          OR telefono LIKE @search
          OR empresa LIKE @search
          OR pipeline_status LIKE @search
        )
      ORDER BY created_at DESC;
      `,
      [{ name: 'search', type: sql.NVarChar(200), value: `%${value}%` }],
    );

    return {
      success: true,
      message: 'Búsqueda de contactos realizada correctamente',
      data: contacts,
    };
  }

  private handleDatabaseError<T>(
    error: any,
    defaultMessage: string,
  ): ApiResponse<T> {
    if (error?.number === 2627 || error?.number === 2601) {
      return {
        success: false,
        message: 'Ya existe un contacto con el mismo email',
        data: null,
      };
    }

    return {
      success: false,
      message: defaultMessage,
      data: null,
    };
  }
}