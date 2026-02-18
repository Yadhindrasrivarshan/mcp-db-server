import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface ContentBlock {
  type: string;
  text?: string;
}

interface ToolResult {
  content?: ContentBlock[];
}

export class MCPDatabaseClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;

  constructor() {
    // Create a client instance
    this.client = new Client({
      name: 'mcp-db-client',
      version: '1.0.0',
    });
  }

  /**
   * Connect to MCP server via stdio
   */
  async connect(serverPath: string): Promise<void> {
    // Create stdio transport to spawn the MCP server and connects back the server via stdio. ServerPath holds the path to start the MCP Server
    this.transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        ...process.env,
        POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
        POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
        POSTGRES_DB: process.env.POSTGRES_DB || 'testdb',
        POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || '6379',
      },
    });

    await this.client.connect(this.transport);
    console.log('✅ Connected to MCP Server');
  }

  /**
   * List all available tools
   */
  async listTools(): Promise<Array<{ name: string; description?: string }>> {
    const tools = await this.client.listTools();
    return tools.tools;
  }

  /**
   * Call a tool and get results
   */
  async callTool(toolName: string, params: Record<string, any>): Promise<string> {
    const result = (await this.client.callTool({
      name: toolName,
      arguments: params,
    })) as ToolResult;

    // Extract text content from result
    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      const textContent = result.content.find((c: ContentBlock) => c.type === 'text');
      return textContent?.text || JSON.stringify(result);
    }

    return JSON.stringify(result);
  }

  /**
   * Postgres: List tables
   */
  async postgresListTables(schema: string = 'public'): Promise<any> {
    const result = await this.callTool('postgres_list_tables', { schema });
    return JSON.parse(result);
  }

  /**
   * Postgres: Execute query
   */
  async postgresQuery(query: string, params?: any[]): Promise<any> {
    const result = await this.callTool('postgres_query', { query, params });
    return JSON.parse(result);
  }

  /**
   * Postgres: Describe table
   */
  async postgresDescribeTable(tableName: string, schema: string = 'public'): Promise<any> {
    const result = await this.callTool('postgres_describe_table', { tableName, schema });
    return JSON.parse(result);
  }

  /**
   * Postgres: Count rows
   */
  async postgresCount(tableName: string, schema: string = 'public'): Promise<number> {
    const result = await this.callTool('postgres_count', { tableName, schema });
    return JSON.parse(result).count;
  }

  /**
   * Redis: Get value
   */
  async redisGet(key: string): Promise<string | null> {
    const result = await this.callTool('redis_get', { key });
    return JSON.parse(result).value;
  }

  /**
   * Redis: Set value
   */
  async redisSet(
    key: string,
    value: string,
    expirationSeconds?: number
  ): Promise<boolean> {
    const result = await this.callTool('redis_set', {
      key,
      value,
      expirationSeconds,
    });
    return JSON.parse(result).success;
  }

  /**
   * Redis: Delete keys
   */
  async redisDel(...keys: string[]): Promise<number> {
    const result = await this.callTool('redis_del', { keys });
    return JSON.parse(result).deletedCount;
  }

  /**
   * Redis: Check if keys exist
   */
  async redisExists(...keys: string[]): Promise<number> {
    const result = await this.callTool('redis_exists', { keys });
    return JSON.parse(result).existingCount;
  }

  /**
   * Redis: Get keys matching pattern
   */
  async redisKeys(pattern: string = '*'): Promise<string[]> {
    const result = await this.callTool('redis_keys', { pattern });
    return JSON.parse(result).keys;
  }

  /**
   * Redis: Set expiration
   */
  async redisExpire(key: string, seconds: number): Promise<boolean> {
    const result = await this.callTool('redis_expire', { key, seconds });
    return JSON.parse(result).success;
  }

  /**
   * Redis: Get info
   */
  async redisInfo(section?: string): Promise<string> {
    const result = await this.callTool('redis_info', { section });
    return JSON.parse(result).info;
  }

  /**
   * Disconnect from server
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.client.close();
      console.log('❌ Disconnected from MCP Server');
    }
  }
}
