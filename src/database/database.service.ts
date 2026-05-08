import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

export interface SqlParameter {
  name: string;
  type: any;
  value: any;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private static pool: sql.ConnectionPool | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async getPool(): Promise<sql.ConnectionPool> {
    if (DatabaseService.pool && DatabaseService.pool.connected) {
      return DatabaseService.pool;
    }

    const dbPort = Number(this.configService.get<string>('DB_PORT')) || 1433;

    const config: sql.config = {
      server: this.configService.get<string>('DB_HOST') || 'localhost',
      port: dbPort,
      database: this.configService.get<string>('DB_NAME') || 'crm_mvp_db',
      user: this.configService.get<string>('DB_USER') || 'sa',
      password: this.configService.get<string>('DB_PASSWORD') || '',
      options: {
        encrypt: this.configService.get<string>('DB_ENCRYPT') === 'true',
        trustServerCertificate:
          this.configService.get<string>('DB_TRUST_SERVER_CERTIFICATE') !==
          'false',
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: 15000,
      requestTimeout: 15000,
    };

    DatabaseService.pool = await sql.connect(config);

    return DatabaseService.pool;
  }

  async query<T = any>(
    queryText: string,
    parameters: SqlParameter[] = [],
  ): Promise<T[]> {
    const pool = await this.getPool();
    const request = pool.request();

    for (const parameter of parameters) {
      request.input(parameter.name, parameter.type, parameter.value);
    }

    const result = await request.query(queryText);

    return result.recordset as T[];
  }

  async onModuleDestroy() {
    if (DatabaseService.pool) {
      await DatabaseService.pool.close();
      DatabaseService.pool = null;
    }
  }
}