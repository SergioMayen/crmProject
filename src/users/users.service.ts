import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-users.dto';
import { ApiResponse, UserRow } from 'src/interfaces/api-response.interface';



interface NextCodeRow {
  next_number: number;
}

@Injectable()
export class UsersService {
  private readonly validRoles = ['SUP', 'ADM', 'OPR', 'CLI', 'SPT'];

  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<UserRow>> {
    try {
      const role = createUserDto.role.trim().toUpperCase();

      if (!this.validRoles.includes(role)) {
        return {
          success: false,
          message: 'Role no permitido',
          data: null,
        };
      }

      const userCode = await this.generateUserCode(role);
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const insertedUsers = await this.databaseService.query<UserRow>(
        `
        INSERT INTO dbo.users (
          username,
          user_code,
          first_name,
          second_name,
          first_lastname,
          second_lastname,
          email,
          password,
          role
        )
        OUTPUT
          INSERTED.id,
          INSERTED.username,
          INSERTED.user_code,
          INSERTED.first_name,
          INSERTED.second_name,
          INSERTED.first_lastname,
          INSERTED.second_lastname,
          INSERTED.email,
          INSERTED.role,
          INSERTED.is_active,
          INSERTED.created_at
        VALUES (
          @username,
          @user_code,
          @first_name,
          @second_name,
          @first_lastname,
          @second_lastname,
          @email,
          @password,
          @role
        );
        `,
        [
          {
            name: 'username',
            type: sql.NVarChar(50),
            value: createUserDto.username.trim(),
          },
          {
            name: 'user_code',
            type: sql.VarChar(10),
            value: userCode,
          },
          {
            name: 'first_name',
            type: sql.NVarChar(80),
            value: createUserDto.first_name.trim(),
          },
          {
            name: 'second_name',
            type: sql.NVarChar(80),
            value: createUserDto.second_name?.trim() || null,
          },
          {
            name: 'first_lastname',
            type: sql.NVarChar(80),
            value: createUserDto.first_lastname.trim(),
          },
          {
            name: 'second_lastname',
            type: sql.NVarChar(80),
            value: createUserDto.second_lastname?.trim() || null,
          },
          {
            name: 'email',
            type: sql.NVarChar(150),
            value: createUserDto.email.trim().toLowerCase(),
          },
          {
            name: 'password',
            type: sql.NVarChar(255),
            value: hashedPassword,
          },
          {
            name: 'role',
            type: sql.Char(3),
            value: role,
          },
        ],
      );

      return {
        success: true,
        message: 'Usuario creado correctamente',
        data: insertedUsers[0],
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'No se pudo crear el usuario');
    }
  }

  async findAll(): Promise<ApiResponse<UserRow[]>> {
    const users = await this.databaseService.query<UserRow>(
      `
      SELECT
        id,
        username,
        user_code,
        first_name,
        second_name,
        first_lastname,
        second_lastname,
        email,
        role,
        is_active,
        created_at
      FROM dbo.users
      ORDER BY created_at DESC;
      `,
    );

    return {
      success: true,
      message: 'Usuarios consultados correctamente',
      data: users,
    };
  }

  async inactivate(id: string): Promise<ApiResponse<null>> {
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return {
        success: false,
        message: 'Id de usuario inválido',
        data: null,
      };
    }

    const result = await this.databaseService.query<{ affected_rows: number }>(
      `
      UPDATE dbo.users
      SET is_active = 0
      WHERE id = @id
        AND is_active = 1;

      SELECT @@ROWCOUNT AS affected_rows;
      `,
      [{ name: 'id', type: sql.Int, value: userId }],
    );

    if (result[0].affected_rows === 0) {
      return {
        success: false,
        message: 'Usuario no encontrado o ya se encuentra inactivo',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Usuario inactivado correctamente',
      data: null,
    };
  }

  private async generateUserCode(role: string): Promise<string> {
    const result = await this.databaseService.query<NextCodeRow>(
      `
      SELECT
        ISNULL(
          MAX(
            TRY_CAST(SUBSTRING(user_code, 4, LEN(user_code)) AS INT)
          ),
          0
        ) + 1 AS next_number
      FROM dbo.users
      WHERE role = @role
        AND user_code LIKE @user_code_pattern;
      `,
      [
        { name: 'role', type: sql.Char(3), value: role },
        {
          name: 'user_code_pattern',
          type: sql.VarChar(10),
          value: `${role}%`,
        },
      ],
    );

    const nextNumber = result[0]?.next_number || 1;

    return `${role}${String(nextNumber).padStart(3, '0')}`;
  }

  private handleDatabaseError<T>(
    error: any,
    defaultMessage: string,
  ): ApiResponse<T> {
    if (error?.number === 2627 || error?.number === 2601) {
      return {
        success: false,
        message: 'Ya existe un usuario con el mismo username, user_code o email',
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