#!/bin/bash

# Below shell script can help you to prepopulate some data to your local postgres and redis instances for MCP server testing.

# To run this script, use the command `bash scripts/test-setup.sh` from the root directory of the project

echo "🧪 Setting up test databases..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing PostgreSQL connection...${NC}"
if psql -h localhost -p 5432 -U postgres -d testdb -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL connection failed${NC}"
    echo "  Make sure Postgres is running: brew services start postgresql@16"
    exit 1
fi

echo -e "${BLUE}Setting up PostgreSQL test data...${NC}"
psql -h localhost -p 5432 -U postgres -d testdb -f scripts/setup.sql

echo -e "${BLUE}Testing Redis connection...${NC}"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis connection failed${NC}"
    echo "  Make sure Redis is running: brew services start redis"
    exit 1
fi

echo -e "${BLUE}Setting up Redis test data...${NC}"
redis-cli <<EOF
SET user:1 "Alice Johnson"
SET user:2 "Bob Smith"
SET user:3 "Carol White"
SET session:abc123 "user_id:1" EX 3600
SET session:def456 "user_id:2" EX 3600
SET cache:product:1 '{"name":"Laptop","price":999.99}' EX 600
SET cache:product:2 '{"name":"Mouse","price":29.99}' EX 600
SETEX temp:notification "Hello from MCP!" 120
EOF

echo -e "${GREEN}✓ Redis test data added${NC}"

echo ""
echo -e "${GREEN}🎉 Test setup complete!${NC}"
echo ""
echo "You can now try these queries:"
echo ""
echo "PostgreSQL:"
echo "  - List tables: postgres_list_tables"
echo "  - Query users: postgres_query with 'SELECT * FROM users'"
echo "  - Describe table: postgres_describe_table with tableName 'users'"
echo ""
echo "Redis:"
echo "  - Get user: redis_get with key 'user:1'"
echo "  - List all keys: redis_keys with pattern '*'"
echo "  - Check sessions: redis_keys with pattern 'session:*'"
echo ""
