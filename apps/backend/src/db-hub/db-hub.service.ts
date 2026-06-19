import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Client as PgClient } from 'pg';
import * as mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { DevForgeEvents, DbQueryPayload } from '@devforge/event-bus';

@Injectable()
export class DbHubService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // --- Connection CRUD ---

  async getConnections(projectId: string) {
    return this.prisma.dbConnection.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createConnection(
    projectId: string,
    dto: {
      name: string;
      type: string;
      host: string;
      port: number;
      database: string;
      username: string;
      password?: string;
    },
  ) {
    return this.prisma.dbConnection.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type,
        host: dto.host,
        port: dto.port,
        database: dto.database,
        username: dto.username,
        password: dto.password ?? '',
      },
    });
  }

  async deleteConnection(id: string) {
    const conn = await this.prisma.dbConnection.findUnique({ where: { id } });
    if (!conn) {
      throw new NotFoundException(`Connection with ID "${id}" not found.`);
    }
    return this.prisma.dbConnection.delete({ where: { id } });
  }

  // --- Connection Testing ---

  async testConnection(config: {
    type: string;
    host: string;
    port: number;
    database: string;
    username: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> {
    const { type, host, port, database, username, password = '' } = config;

    if (type === 'postgres') {
      const client = new PgClient({
        host,
        port,
        database,
        user: username,
        password,
        connectionTimeoutMillis: 5000,
      });
      try {
        await client.connect();
        await client.query('SELECT 1');
        return {
          success: true,
          message: 'Successfully connected to PostgreSQL.',
        };
      } catch (err: unknown) {
        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : 'Failed to connect to PostgreSQL.',
        };
      } finally {
        await client.end().catch(() => {});
      }
    }

    if (type === 'mysql') {
      try {
        const connection = await mysql.createConnection({
          host,
          port,
          database,
          user: username,
          password,
          connectTimeout: 5000,
        });
        await connection.query('SELECT 1');
        await connection.end();
        return { success: true, message: 'Successfully connected to MySQL.' };
      } catch (err: unknown) {
        return {
          success: false,
          message:
            err instanceof Error ? err.message : 'Failed to connect to MySQL.',
        };
      }
    }

    if (type === 'mongodb') {
      // Build standard mongo uri
      // mongodb://[username:password@]host[:port]/[database]
      const auth = username
        ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
        : '';
      const uri = `mongodb://${auth}${host}:${port}/${database}?serverSelectionTimeoutMS=5000`;
      const client = new MongoClient(uri);

      try {
        await client.connect();
        const db = client.db(database);
        await db.command({ ping: 1 });
        return { success: true, message: 'Successfully connected to MongoDB.' };
      } catch (err: unknown) {
        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : 'Failed to connect to MongoDB.',
        };
      } finally {
        await client.close().catch(() => {});
      }
    }

    throw new BadRequestException(`Unsupported database type: ${type}`);
  }

  // --- Query Execution ---

  async executeQuery(connectionId: string, queryText: string) {
    const conn = await this.prisma.dbConnection.findUnique({
      where: { id: connectionId },
    });

    if (!conn) {
      throw new NotFoundException(
        `Connection with ID "${connectionId}" not found.`,
      );
    }

    const queryId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    let status = 'success';
    let errorMessage: string | null = null;
    let rowsCount = 0;
    let resultPayload: unknown = null;

    try {
      if (conn.type === 'postgres') {
        const pgClient = new PgClient({
          host: conn.host,
          port: conn.port,
          database: conn.database,
          user: conn.username,
          password: conn.password,
          connectionTimeoutMillis: 5000,
        });

        await pgClient.connect();
        try {
          const res = await pgClient.query(queryText);
          rowsCount = res.rowCount ?? 0;
          resultPayload = res.rows;
        } finally {
          await pgClient.end().catch(() => {});
        }
      } else if (conn.type === 'mysql') {
        const mysqlConn = await mysql.createConnection({
          host: conn.host,
          port: conn.port,
          database: conn.database,
          user: conn.username,
          password: conn.password,
          connectTimeout: 5000,
        });

        try {
          const [rows] = await mysqlConn.query(queryText);
          if (Array.isArray(rows)) {
            rowsCount = rows.length;
            resultPayload = rows;
          } else {
            // For INSERT/UPDATE/DELETE statement responses (ResultSetHeader)
            const header = rows as unknown as Record<string, unknown>;
            rowsCount =
              typeof header.affectedRows === 'number' ? header.affectedRows : 0;
            resultPayload = rows;
          }
        } finally {
          await mysqlConn.end().catch(() => {});
        }
      } else if (conn.type === 'mongodb') {
        const auth = conn.username
          ? `${encodeURIComponent(conn.username)}:${encodeURIComponent(conn.password)}@`
          : '';
        const uri = `mongodb://${auth}${conn.host}:${conn.port}/${conn.database}?serverSelectionTimeoutMS=5000`;
        const mongoClient = new MongoClient(uri);

        await mongoClient.connect();
        try {
          const db = mongoClient.db(conn.database);
          let parsedCommand: Record<string, unknown>;

          try {
            parsedCommand = JSON.parse(queryText) as Record<string, unknown>;
          } catch {
            throw new BadRequestException(
              'MongoDB query must be a valid JSON command string.',
            );
          }

          const res = await db.command(parsedCommand);
          resultPayload = res;

          // Attempt to extract row count for commands like "find"
          const resObj = res as Record<string, unknown>;
          const cursor = resObj.cursor as Record<string, unknown> | undefined;
          if (cursor && Array.isArray(cursor.firstBatch)) {
            rowsCount = cursor.firstBatch.length;
          } else if (typeof resObj.n === 'number') {
            rowsCount = resObj.n;
          } else {
            rowsCount = 1;
          }
        } finally {
          await mongoClient.close().catch(() => {});
        }
      } else {
        throw new BadRequestException(
          `Unsupported connection type: ${conn.type}`,
        );
      }
    } catch (err: unknown) {
      status = 'error';
      errorMessage =
        err instanceof Error
          ? err.message
          : 'Unknown database query execution error.';
      resultPayload = { error: errorMessage };
    }

    const latencyMs = Date.now() - startTime;

    // 1. Emit Event Bus DB_QUERY event
    const eventPayload: DbQueryPayload = {
      queryId,
      sql: queryText,
      latencyMs,
      affectedRows: rowsCount,
      timestamp: Date.now(),
    };
    this.eventBus.emit(DevForgeEvents.DB_QUERY, eventPayload);

    // 2. Save query execution history log in PostgreSQL
    await this.prisma.dbQueryHistory.create({
      data: {
        query: queryText,
        latencyMs,
        status,
        error: errorMessage,
        rowsCount: rowsCount,
        connectionId,
      },
    });

    return {
      status,
      latencyMs,
      rowsCount,
      error: errorMessage,
      result: resultPayload,
    };
  }

  // --- History Explorer ---

  async getHistory(connectionId: string) {
    return this.prisma.dbQueryHistory.findMany({
      where: { connectionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async clearHistory(connectionId: string) {
    return this.prisma.dbQueryHistory.deleteMany({
      where: { connectionId },
    });
  }
}
