import { MCPDatabaseClient } from './client/mcp-client.js';
import path from 'path';

// This is standalone client script to test the MCP Server and tools. Feel free to validate the tools by modifying the queries and commands in this file.
async function main() {
  const client = new MCPDatabaseClient();

  try {
    const serverPath = path.join(process.cwd(), 'build', 'index.js');
    console.log('Connecting to server at:', serverPath);
    
    await client.connect(serverPath);

    console.log('\n📋 Available Tools:');
    const tools = await client.listTools();
    tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
    });

    console.log('\n--- PostgreSQL Queries ---\n');

    const tables = await client.postgresListTables();
    console.log('Tables:', tables);

    const users = await client.postgresQuery('SELECT * FROM users LIMIT 2');
    console.log('Users:', users);

    console.log('\n--- Redis Operations ---\n');

    const userKeys = await client.redisKeys('user:*');
    console.log('User keys:', userKeys);

    for (const key of userKeys.slice(0, 2)) {
      const value = await client.redisGet(key);
      console.log(`  ${key} = ${value}`);
    }

    console.log('\n✅ All operations completed!');
    console.log('Session is completed.\n');

    // use below code to make it live all the time
    // await new Promise(() => {});

  } catch (error) {
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    console.log('Disconnecting client...');
    await client.disconnect();
    console.log('Client disconnected. Goodbye!');
  }
}

main();