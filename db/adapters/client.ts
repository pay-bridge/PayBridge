import { DatabaseClient, DatabaseConfig } from './types';
import { getDatabaseConfig } from './config';
import { DatabaseFactory } from './factory';

// Unified database client
export class UnifiedDatabaseClient {
  private client: DatabaseClient;
  private config: DatabaseConfig;

  constructor(config?: DatabaseConfig) {
    this.config = config || getDatabaseConfig();
    this.client = DatabaseFactory.createClient(this.config);
  }

  // User operations
  async getUser(): Promise<any> {
    return this.client.getUser();
  }

  async createUser(userData: any): Promise<any> {
    return this.client.createUser(userData);
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return this.client.updateUser(userId, userData);
  }

  // Customer operations
  async getCustomer(userId: string): Promise<any> {
    return this.client.getCustomer(userId);
  }

  async createCustomer(customerData: any): Promise<any> {
    return this.client.createCustomer(customerData);
  }

  async updateCustomer(userId: string, customerData: any): Promise<any> {
    return this.client.updateCustomer(userId, customerData);
  }

  // Product operations
  async getProducts(): Promise<any[]> {
    return this.client.getProducts();
  }

  async getProduct(productId: string): Promise<any> {
    return this.client.getProduct(productId);
  }

  async createProduct(productData: any): Promise<any> {
    return this.client.createProduct(productData);
  }

  async updateProduct(productId: string, productData: any): Promise<any> {
    return this.client.updateProduct(productId, productData);
  }

  async deleteProduct(productId: string): Promise<void> {
    return this.client.deleteProduct(productId);
  }

  // Price operations
  async getPrices(): Promise<any[]> {
    return this.client.getPrices();
  }

  async getPrice(priceId: string): Promise<any> {
    return this.client.getPrice(priceId);
  }

  async createPrice(priceData: any): Promise<any> {
    return this.client.createPrice(priceData);
  }

  async updatePrice(priceId: string, priceData: any): Promise<any> {
    return this.client.updatePrice(priceId, priceData);
  }

  async deletePrice(priceId: string): Promise<void> {
    return this.client.deletePrice(priceId);
  }

  // Subscription operations
  async getSubscription(userId: string): Promise<any> {
    return this.client.getSubscription(userId);
  }

  async getSubscriptions(): Promise<any[]> {
    return this.client.getSubscriptions();
  }

  async createSubscription(subscriptionData: any): Promise<any> {
    return this.client.createSubscription(subscriptionData);
  }

  async updateSubscription(subscriptionId: string, subscriptionData: any): Promise<any> {
    return this.client.updateSubscription(subscriptionId, subscriptionData);
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    return this.client.deleteSubscription(subscriptionId);
  }

  // Auth operations
  async signUp(email: string, password: string): Promise<any> {
    return this.client.signUp(email, password);
  }

  async signIn(email: string, password: string): Promise<any> {
    return this.client.signIn(email, password);
  }

  async signOut(): Promise<void> {
    return this.client.signOut();
  }

  async resetPassword(email: string): Promise<any> {
    return this.client.resetPassword(email);
  }

  // Webhook operations
  async handleWebhook(event: any): Promise<void> {
    return this.client.handleWebhook(event);
  }

  // Get the underlying client for advanced operations
  getUnderlyingClient(): DatabaseClient {
    return this.client;
  }

  // Get current configuration
  getConfig(): DatabaseConfig {
    return this.config;
  }

  // Get database provider
  getProvider(): string {
    return this.config.provider;
  }
}

// Convenience functions
export const createDatabaseClient = (config?: DatabaseConfig): UnifiedDatabaseClient => {
  return new UnifiedDatabaseClient(config);
};

export const getDatabaseClient = (): UnifiedDatabaseClient => {
  return new UnifiedDatabaseClient();
};

// Singleton instance for global use
let globalDatabaseClient: UnifiedDatabaseClient | null = null;

export const getGlobalDatabaseClient = (): UnifiedDatabaseClient => {
  if (!globalDatabaseClient) {
    globalDatabaseClient = new UnifiedDatabaseClient();
  }
  return globalDatabaseClient;
};

export const resetGlobalDatabaseClient = (): void => {
  globalDatabaseClient = null;
  DatabaseFactory.reset();
}; 