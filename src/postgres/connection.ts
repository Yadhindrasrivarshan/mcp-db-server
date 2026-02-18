import pg from 'pg';

const { Pool } = pg;

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/***
 * PostgresConnection class manages the connection pool to PostgreSQL and provides methods for executing queries, listing tables, describing table schemas, and more. It includes error handling and connection management to ensure robust interactions with the PostgreSQL database.
 */

export class PostgresConnection {
  private pool: pg.Pool | null = null;
  private config: PostgresConfig;

  constructor(config: PostgresConfig) {
    this.config = config;
  }

  /**
   * Initialize connection pool with dynamic credentials
   */
  async connect(): Promise<void> {
    if (this.pool) {
      console.error('[Postgres] Connection pool already exists');
      return;
    }

    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: this.config.max || 10,
        idleTimeoutMillis: this.config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis || 2000,
      });

      const client = await this.pool.connect();
      console.error(`[Postgres] Connected to ${this.config.database} at ${this.config.host}:${this.config.port}`);
      client.release();
    } catch (error) {
      console.error('[Postgres] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Execute a SQL query
   */
  async query(sql: string, params?: any[]): Promise<pg.QueryResult> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const result = await this.pool.query(sql, params);
      return result;
    } catch (error) {
      console.error('[Postgres] Query error:', error);
      throw error;
    }
  }

  /**
   * List all tables in the current database
   */
  async listTables(): Promise<string[]> {
    const result = await this.query(
      `SELECT tablename 
       FROM pg_tables 
       WHERE schemaname = 'public' 
       ORDER BY tablename`
    );
    return result.rows.map((row: any) => row.tablename);
  }

  /**
   * Describe table schema
   */
  async describeTable(tableName: string): Promise<any[]> {
    const result = await this.query(
      `SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );
    return result.rows;
  }

  /**
   * List all databases (requires superuser or appropriate permissions)
   */
  async listDatabases(): Promise<string[]> {
    const result = await this.query(
      `SELECT datname FROM pg_database 
       WHERE datistemplate = false 
       ORDER BY datname`
    );
    return result.rows.map((row: any) => row.datname);
  }

  /**
   * Close the connection pool
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.error('[Postgres] Connection pool closed');
      this.pool = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.pool !== null;
  }
}
