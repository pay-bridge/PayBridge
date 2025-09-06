import { DatabaseConfig, DatabaseProvider } from './types';

// Default database configuration
export const getDefaultDatabaseConfig = (): DatabaseConfig => {
  const provider = (process.env.DATABASE_PROVIDER as DatabaseProvider) || 'supabase';
  
  switch (provider) {
    case 'sqlite':
      return {
        provider: 'sqlite',
        filePath: process.env.SQLITE_FILE_PATH || './paybridge.db'
      };
    
    case 'postgresql':
      return {
        provider: 'postgresql',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'paybridge',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        ssl: process.env.POSTGRES_SSL === 'true'
      };
    
    case 'mysql':
      return {
        provider: 'mysql',
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        database: process.env.MYSQL_DB || 'paybridge',
        username: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        ssl: process.env.MYSQL_SSL === 'true'
      };
    
    case 'supabase':
    default:
      return {
        provider: 'supabase',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      };
  }
};

// Validate database configuration
export const validateDatabaseConfig = (config: DatabaseConfig): boolean => {
  switch (config.provider) {
    case 'sqlite':
      return !!config.filePath;
    
    case 'postgresql':
      return !!(config.host && config.database && config.username);
    
    case 'mysql':
      return !!(config.host && config.database && config.username);
    
    case 'supabase':
      return !!(config.supabaseUrl && config.supabaseKey);
    
    default:
      return false;
  }
};

// Get current database configuration
export const getDatabaseConfig = (): DatabaseConfig => {
  const config = getDefaultDatabaseConfig();
  
  if (!validateDatabaseConfig(config)) {
    throw new Error(`Invalid database configuration for provider: ${config.provider}`);
  }
  
  return config;
};

// Check if running in development mode
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Get database URL for connection
export const getDatabaseUrl = (config: DatabaseConfig): string => {
  switch (config.provider) {
    case 'sqlite':
      return `sqlite://${config.filePath}`;
    
    case 'postgresql':
      const ssl = config.ssl ? '?sslmode=require' : '';
      return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${ssl}`;
    
    case 'mysql':
      const mysqlSsl = config.ssl ? '?ssl=true' : '';
      return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${mysqlSsl}`;
    
    case 'supabase':
      return config.supabaseUrl || '';
    
    default:
      throw new Error(`Unsupported database provider: ${config.provider}`);
  }
}; 