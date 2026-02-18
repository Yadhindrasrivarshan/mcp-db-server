#!/usr/bin/env node

// above line is for making this file executable and its well known as shebang in unix system.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { PostgresConnection, PostgresConfig } from './postgres/connection.js';
import { registerPostgresTools } from './postgres/tools.js';
import { RedisConnection, RedisConfig } from './redis/connection.js';
import { registerRedisTools } from './redis/tools.js';

/**
 * Load configuration from environment variables, fallback configs are provided for local development , feel free to update the environment variable accordingly
 */
function loadConfig(): { postgres: PostgresConfig; redis: RedisConfig } {
  return {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'testdb',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '10', 10),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECT_TIMEOUT || '2000', 10),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '5000', 10),
    },
  };
}

async function main() {
  console.log('Starting MCP Database Server...');

  const config = loadConfig();
  console.log('Configuration loaded from environment variables');

  const postgresConnection = new PostgresConnection(config.postgres);
  const redisConnection = new RedisConnection(config.redis);

  try {
    await postgresConnection.connect();
  } catch (error) {
    console.error('Failed to connect to Postgres:', error);
    console.error('Postgres tools will not be available');
  }

  try {
    await redisConnection.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    console.error('Redis tools will not be available');
  }

  const server = new McpServer(
    {
      name: 'mcp-db-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  if (postgresConnection.isConnected()) {
    registerPostgresTools(server, postgresConnection);
  }

  if (redisConnection.isConnected()) {
    registerRedisTools(server, redisConnection);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('MCP Database Server running on stdio');
  console.log(`Postgres: ${postgresConnection.isConnected() ? 'Connected' : 'Disconnected'}`);
  console.log(`Redis: ${redisConnection.isConnected() ? 'Connected' : 'Disconnected'}`);

  // Cleanup on exit
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await postgresConnection.disconnect();
    await redisConnection.disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});