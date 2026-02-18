import { z } from 'zod';
import { RedisConnection } from './connection.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Register all Redis tools with the MCP server
 */


export function registerRedisTools(server: McpServer, connection: RedisConnection) {
  // Tool 1 -> Get value by key
  server.registerTool(
    'redis_get',
    {
      description: 'Get a value from Redis by key',
      inputSchema: z.object({
        key: z.string().describe('Redis key to retrieve'),
      }),
    },
    async ({ key }) => {
      const value = await connection.get(key);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ key, value }, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2 -> Set key-value pair
  server.registerTool(
    'redis_set',
    {
      description: 'Set a key-value pair in Redis with optional expiration',
      inputSchema: z.object({
        key: z.string().describe('Redis key to set'),
        value: z.string().describe('Value to store'),
        expirationSeconds: z.number().optional().describe('Optional expiration time in seconds'),
      }),
    },
    async ({ key, value, expirationSeconds }) => {
      await connection.set(key, value, expirationSeconds);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                key,
                expiresIn: expirationSeconds ? `${expirationSeconds}s` : 'never',
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 3 -> Delete key
  server.registerTool(
    'redis_del',
    {
      description: 'Delete one or more keys from Redis',
      inputSchema: z.object({
        keys: z.array(z.string()).describe('Array of Redis keys to delete'),
      }),
    },
    async ({ keys }) => {
      const count = await connection.del(...keys);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                deletedCount: count,
                keys,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 4 -> Check if key exists
  server.registerTool(
    'redis_exists',
    {
      description: 'Check if one or more keys exist in Redis',
      inputSchema: z.object({
        keys: z.array(z.string()).describe('Array of Redis keys to check'),
      }),
    },
    async ({ keys }) => {
      const count = await connection.exists(...keys);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                existingCount: count,
                keys,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 5 -> Set expiration on key
  server.registerTool(
    'redis_expire',
    {
      description: 'Set expiration time on a Redis key',
      inputSchema: z.object({
        key: z.string().describe('Redis key to set expiration on'),
        seconds: z.number().describe('Expiration time in seconds'),
      }),
    },
    async ({ key, seconds }) => {
      const success = await connection.expire(key, seconds);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success,
                key,
                expiresIn: `${seconds}s`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 6 -> Get all keys matching pattern
  server.registerTool(
    'redis_keys',
    {
      description: 'Get all Redis keys matching a pattern',
      inputSchema: z.object({
        pattern: z.string().default('*').describe('Pattern to match keys (default: *)'),
      }),
    },
    async ({ pattern = '*' }) => {
      const keys = await connection.keys(pattern);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                pattern,
                count: keys.length,
                keys,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 7 -> Get database info
  server.registerTool(
    'redis_info',
    {
      description: 'Get Redis server information',
      inputSchema: z.object({
        section: z.string().optional().describe('Optional info section (e.g., "server", "memory", "stats")'),
      }),
    },
    async ({ section }) => {
      const info = await connection.getInfo()
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ info }, null, 2),
          },
        ],
      };
    }
  );
}