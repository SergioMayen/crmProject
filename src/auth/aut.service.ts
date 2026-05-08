import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/interfaces/api-response.interface';

interface UserAuthRow {
  id: number;
  username: string;
  user_code: string;
  first_name: string;
  first_lastname: string;
  email: string;
  password: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

 async login(loginDto: LoginDto): Promise<ApiResponse<any>> {
    const username = loginDto.username.trim();

    const users = await this.databaseService.query<UserAuthRow>(
      `
      SELECT TOP 1
        id,
        username,
        user_code,
        first_name,
        first_lastname,
        email,
        password,
        role
      FROM dbo.users
      WHERE username = @username
        AND is_active = 1;
      `,
      [{ name: 'username', type: sql.NVarChar(50), value: username }],
    );

    if (users.length === 0) {
      return {
        success: false,
        message: 'Usuario o password incorrecto',
        data: null,
      };
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Usuario o password incorrecto',
        data: null,
      };
    }

    const payload = {
      sub: user.id,
      username: user.username,
      user_code: user.user_code,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: 'Login realizado correctamente',
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          username: user.username,
          user_code: user.user_code,
          first_name: user.first_name,
          first_lastname: user.first_lastname,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}