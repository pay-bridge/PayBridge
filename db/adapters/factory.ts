import { DatabaseClient, DatabaseConfig } from './types';
import { getDatabaseConfig } from './config';

// Import database clients
import { SQLiteClient } from './sqlite/client';
import { SupabaseAdapter } from './supabase/adapter';

// Database client factory
export class DatabaseFactory {
  private static instance: DatabaseClient | null = null;

  static createClient(config?: DatabaseConfig): DatabaseClient {
    if (this.instance) {
      return this.instance;
    }

    const dbConfig = config || getDatabaseConfig();

    switch (dbConfig.provider) {
      case 'sqlite':
        this.instance = new SQLiteClient(dbConfig);
        break;
      
      case 'supabase':
        this.instance = new SupabaseAdapter(dbConfig);
        break;
      
      case 'postgresql':
        // This will be implemented later
        throw new Error('PostgreSQL client not yet implemented');
      
      case 'mysql':
        // This will be implemented later
        throw new Error('MySQL client not yet implemented');
      
      default:
        throw new Error(`Unsupported database provider: ${dbConfig.provider}`);
    }

    return this.instance;
  }

  static getClient(): DatabaseClient {
    if (!this.instance) {
      return this.createClient();
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

// Convenience function to get database client
export const getDatabaseClient = (): DatabaseClient => {
  return DatabaseFactory.getClient();
};

// Convenience function to create database client with custom config
export const createDatabaseClient = (config: DatabaseConfig): DatabaseClient => {
  return DatabaseFactory.createClient(config);
}; 