import { createClient, RedisClientType } from 'redis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  connectTimeout?: number;
}

/***
 * RedisConnection class manages the connection to redis and provides methods for operations like Get,Set etc.
 * It also includes error handling and connection management to ensure robust interactions with the Redis database.
 */

export class RedisConnection {
  private client: RedisClientType | null = null;
  private config: RedisConfig;

  constructor(config: RedisConfig) {
    this.config = config;
  }


  //Redis connection intialization
  async connect(): Promise<void> {
    if (this.client) {
      console.error('[Redis] Client already connected');
      return;
    }

    try {
      const url = this.config.password
        ? `redis://:${this.config.password}@${this.config.host}:${this.config.port}`
        : `redis://${this.config.host}:${this.config.port}`;

      this.client = createClient({
        url,
        database: this.config.db || 0,
        socket: {
          connectTimeout: this.config.connectTimeout || 5000,
        },
      });

      this.client.on('error', (err) => {
        console.error('[Redis] Client error:', err);
      });

      await this.client.connect();
      console.error(`[Redis] Connected to ${this.config.host}:${this.config.port}`);
    } catch (error) {
      console.error('[Redis] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return await this.client.get(key);
  }

  /**
   * Set key-value pair with optional expiration
   */
  async set(key: string, value: string, expirationSeconds?: number): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }

    if (expirationSeconds) {
      return await this.client.set(key, value, { EX: expirationSeconds });
    }
    return await this.client.set(key, value);
  }

  /**
   * Delete one or more keys
   */
  async del(...keys: string[]): Promise<number> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return await this.client.del(keys);
  }

  /**
   * Check if key exists
   */
  async exists(...keys: string[]): Promise<number> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return await this.client.exists(keys);
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return await this.client.keys(pattern);
  }

  /**
   * Get time-to-live for a key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return await this.client.ttl(key);
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return await this.client.expire(key, seconds);
  }

  /**
   * Get all keys and their values (use with caution on large databases)
   */
  async getAll(pattern: string = '*'): Promise<Record<string, string>> {
    if (!this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }

    const keys = await this.keys(pattern);
    const result: Record<string, string> = {};

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Close the Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.error('[Redis] Connection closed');
      this.client = null;
    }
  }


  /**
   * Get Redis server info
   */

  async getInfo(): Promise<string> {
    if(!this.client){
        throw new Error("Redis is not yet connected, call connect() first")
    }

    return this.client.info()
  }

  /**
   * Function to check if redis client is connected and opened
   */
  isConnected(): boolean {
    return this.client !== null && this.client.isOpen;
  }
}
