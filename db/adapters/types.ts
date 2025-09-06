// Database abstraction layer types
export type DatabaseProvider = 'supabase' | 'sqlite' | 'postgresql' | 'mysql';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  url?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  // SQLite specific
  filePath?: string;
  // Supabase specific
  supabaseUrl?: string;
  supabaseKey?: string;
  supabaseServiceRoleKey?: string;
}

export interface DatabaseClient {
  // User operations
  getUser(): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(userId: string, userData: any): Promise<any>;
  
  // Customer operations
  getCustomer(userId: string): Promise<any>;
  createCustomer(customerData: any): Promise<any>;
  updateCustomer(userId: string, customerData: any): Promise<any>;
  
  // Product operations
  getProducts(): Promise<any[]>;
  getProduct(productId: string): Promise<any>;
  createProduct(productData: any): Promise<any>;
  updateProduct(productId: string, productData: any): Promise<any>;
  deleteProduct(productId: string): Promise<void>;
  
  // Price operations
  getPrices(): Promise<any[]>;
  getPrice(priceId: string): Promise<any>;
  createPrice(priceData: any): Promise<any>;
  updatePrice(priceId: string, priceData: any): Promise<any>;
  deletePrice(priceId: string): Promise<void>;
  
  // Subscription operations
  getSubscription(userId: string): Promise<any>;
  getSubscriptions(): Promise<any[]>;
  createSubscription(subscriptionData: any): Promise<any>;
  updateSubscription(subscriptionId: string, subscriptionData: any): Promise<any>;
  deleteSubscription(subscriptionId: string): Promise<void>;
  
  // Auth operations
  signUp(email: string, password: string): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<any>;
  
  // Webhook operations
  handleWebhook(event: any): Promise<void>;
}

export interface DatabaseQueryBuilder {
  select(fields?: string[]): DatabaseQueryBuilder;
  from(table: string): DatabaseQueryBuilder;
  where(field: string, operator: string, value: any): DatabaseQueryBuilder;
  eq(field: string, value: any): DatabaseQueryBuilder;
  neq(field: string, value: any): DatabaseQueryBuilder;
  gt(field: string, value: any): DatabaseQueryBuilder;
  gte(field: string, value: any): DatabaseQueryBuilder;
  lt(field: string, value: any): DatabaseQueryBuilder;
  lte(field: string, value: any): DatabaseQueryBuilder;
  like(field: string, value: string): DatabaseQueryBuilder;
  in(field: string, values: any[]): DatabaseQueryBuilder;
  orderBy(field: string, direction?: 'asc' | 'desc'): DatabaseQueryBuilder;
  limit(count: number): DatabaseQueryBuilder;
  offset(count: number): DatabaseQueryBuilder;
  single(): Promise<any>;
  maybeSingle(): Promise<any | null>;
  execute(): Promise<any[]>;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  execute(query: string, params?: any[]): Promise<any>;
} 