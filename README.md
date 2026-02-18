# MCP Database Server

A Model Context Protocol (MCP) server for dynamic database connections supporting PostgreSQL and Redis.

## Features

- 🔌 **Dynamic Connections**: Connect to databases using runtime credentials
- 🗄️ **PostgreSQL Support**: Execute queries, inspect schemas, list tables
- ⚡ **Redis Support**: Perform cache operations (GET, SET, DEL, KEYS, etc.)
- 🔒 **Secure**: Credentials passed at runtime, not hardcoded
- 🛠️ **Easy Setup**: Works locally and can be deployed remotely


## Installation & Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (for Postgres features)
3. **Redis** (for Redis features)

### Installing PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16

# Create a test database
createdb testdb
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a test database
sudo -u postgres createdb testdb
```

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer and follow setup wizard
- Add PostgreSQL bin directory to PATH

### Installing Redis

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
- Download from [redis.io](https://redis.io/download/)
- Or use [Memurai](https://www.memurai.com/) (Redis-compatible for Windows)

### Setting Up the MCP Server

1. **Clone**
```bash
https://github.com/Yadhindrasrivarshan/mcp-db-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Create configuration file:**
```bash
cp config/example.config.json config/local.config.json
```

Edit [config/local.config.json](config/local.config.json) with your database credentials:
```json
{
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "database": "testdb",
    "user": "your_username",
    "password": "your_password"
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "password": ""
  }
}
```

## Usage

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```


### Configuring in Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-db-server": {
      "command": "node",
      "args": [
        "/Users/Z00GJBZ/Documents/MCP AI/mcp-db-help/build/index.js"
      ],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "testdb",
        "POSTGRES_USER": "your_username",
        "POSTGRES_PASSWORD": "your_password",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "REDIS_PASSWORD": ""
      }
    }
  }
}
```

### Configuring mcp.json in github copilot

```bash
mac -> cmd + shift + P -> Opens vscode configuration option
search -> mcp , click MCP: Open user configuration
json -> Update the json with below JSON
```

```json
{ 
    "mcp-db-server": {
            "command": "/Users/{username}/.nvm/versions/node/v24.13.1/bin/node",
            "args": [
                "/Users/{username}/folders/MCP_AI/mcp-db-help/build/index.js"
            ],
            "type": "stdio",
            "env": {
                "POSTGRES_HOST": "localhost",
                "POSTGRES_PORT": "5432",
                "POSTGRES_DB": "testdb",
                "POSTGRES_USER": "postgres",
                "POSTGRES_PASSWORD": "",
                "REDIS_HOST": "localhost",
                "REDIS_PORT": "6379"
            }
        }
}        
```

## Available Tools

### PostgreSQL Tools

- `postgres_query` - Execute SQL queries
- `postgres_list_tables` - List all tables in the database
- `postgres_describe_table` - Get schema information for a table
- `postgres_list_databases` - List all databases (admin only)

### Redis Tools

- `redis_get` - Get value by key
- `redis_set` - Set key-value pair
- `redis_del` - Delete key(s)
- `redis_keys` - List keys matching pattern
- `redis_exists` - Check if key exists
- `redis_ttl` - Get time-to-live for a key

### Build Issues

```bash
# Clean and rebuild
rm -rf build node_modules
npm install
npm run build
```

## Contributing

This is a learning project! Feel free to experiment and add new features.

## License

MIT
