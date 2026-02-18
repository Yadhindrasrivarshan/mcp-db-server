import { z } from 'zod';
import { PostgresConnection } from './connection.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';


export function registerPostgresTools(server: McpServer, connection: PostgresConnection) {
  // Tool 1 -> Execute SELECT query
  server.registerTool(
    'postgres_query',
    {
      title: 'Execute SQL Query',
      description: 'Execute a SELECT query on PostgreSQL database',
      inputSchema: z.object({
        query: z.string().describe('SQL SELECT query to execute'),
        params: z.array(z.any()).optional().describe('Optional query parameters for prepared statements'),
      }),
    },
    async ({ query, params }) => {
      const result = await connection.query(query, params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                rowCount: result.rows.length,
                rows: result.rows,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 2 -> Get table schema
  server.registerTool(
    'postgres_describe_table',
    {
      title: 'Describe Table Schema',
      description: 'Get the schema information for a PostgreSQL table',
      inputSchema: z.object({
        tableName: z.string().describe('Name of the table to describe'),
        schema: z.string().optional().default('public').describe('Schema name (default: public)'),
      }),
    },
    async ({ tableName, schema = 'public' }) => {
      const result = await connection.query(
        `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
        `,
        [schema, tableName]
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                schema,
                table: tableName,
                columns: result.rows,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 3 -> List all tables
  server.registerTool(
    'postgres_list_tables',
    {
      title: 'List current database tables',
      description: 'List all tables in the PostgreSQL database',
      inputSchema: z.object({
        schema: z.string().optional().default('public').describe('Schema name (default: public)'),
      }),
    },
    async ({ schema = 'public' }) => {
      const result = await connection.query(
        `
        SELECT 
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema = $1
        ORDER BY table_name
        `,
        [schema]
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                schema,
                tables: result.rows,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 4 -> Get table row count
  server.registerTool(
    'postgres_count',
    {
      title:'Count number of rows in a table',
      description: 'Get the number of rows in a PostgreSQL table',
      inputSchema: z.object({
        tableName: z.string().describe('Name of the table to count'),
        schema: z.string().optional().default('public').describe('Schema name (default: public)'),
      }),
    },
    async ({ tableName, schema = 'public' }) => {
      const result = await connection.query(
        `SELECT COUNT(*) as count FROM ${schema}.${tableName}`
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                schema,
                table: tableName,
                count: parseInt(result.rows[0].count, 10),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}