import Database from 'better-sqlite3';
import { DatabaseClient, DatabaseConfig } from '../types';
import { createHash } from 'crypto';

export class SQLiteClient implements DatabaseClient {
  private db: Database.Database;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.db = new Database(config.filePath || './paybridge.db');
    this.initializeTables();
  }

  private initializeTables() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        billing_address TEXT,
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        stripe_customer_id TEXT,
        razorpay_customer_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        active BOOLEAN DEFAULT true,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS prices (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        active BOOLEAN DEFAULT true,
        description TEXT,
        unit_amount INTEGER,
        currency TEXT,
        type TEXT CHECK(type IN ('one_time', 'recurring')),
        interval TEXT CHECK(interval IN ('day', 'week', 'month', 'year')),
        interval_count INTEGER,
        trial_period_days INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT CHECK(status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused')),
        metadata TEXT,
        price_id TEXT,
        quantity INTEGER,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        current_period_start DATETIME DEFAULT CURRENT_TIMESTAMP,
        current_period_end DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        cancel_at DATETIME,
        canceled_at DATETIME,
        trial_start DATETIME,
        trial_end DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (price_id) REFERENCES prices(id)
      );

      CREATE TABLE IF NOT EXISTS auth_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

  // User operations
  async getUser(): Promise<any> {
    // This would need to be implemented based on your auth system
    // For now, return null as this is typically handled by auth middleware
    return null;
  }

  async createUser(userData: any): Promise<any> {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, full_name, avatar_url, billing_address, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userData.id,
      userData.email,
      userData.full_name,
      userData.avatar_url,
      JSON.stringify(userData.billing_address),
      JSON.stringify(userData.payment_method)
    );
    
    return { id: userData.id, ...userData };
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET full_name = ?, avatar_url = ?, billing_address = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      userData.full_name,
      userData.avatar_url,
      JSON.stringify(userData.billing_address),
      JSON.stringify(userData.payment_method),
      userId
    );
    
    return this.getUserById(userId);
  }

  private async getUserById(userId: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(userId);
    
    if (user) {
      return {
        ...user,
        billing_address: user.billing_address ? JSON.parse(user.billing_address) : null,
        payment_method: user.payment_method ? JSON.parse(user.payment_method) : null
      };
    }
    return null;
  }

  // Customer operations
  async getCustomer(userId: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
    return stmt.get(userId);
  }

  async createCustomer(customerData: any): Promise<any> {
    const stmt = this.db.prepare(`
      INSERT INTO customers (id, stripe_customer_id, razorpay_customer_id)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(
      customerData.id,
      customerData.stripe_customer_id,
      customerData.razorpay_customer_id
    );
    
    return customerData;
  }

  async updateCustomer(userId: string, customerData: any): Promise<any> {
    const stmt = this.db.prepare(`
      UPDATE customers 
      SET stripe_customer_id = ?, razorpay_customer_id = ?
      WHERE id = ?
    `);
    
    stmt.run(
      customerData.stripe_customer_id,
      customerData.razorpay_customer_id,
      userId
    );
    
    return this.getCustomer(userId);
  }

  // Product operations
  async getProducts(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM products WHERE active = true');
    const products = stmt.all();
    
    return products.map(product => ({
      ...product,
      metadata: product.metadata ? JSON.parse(product.metadata) : null
    }));
  }

  async getProduct(productId: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(productId);
    
    if (product) {
      return {
        ...product,
        metadata: product.metadata ? JSON.parse(product.metadata) : null
      };
    }
    return null;
  }

  async createProduct(productData: any): Promise<any> {
    const stmt = this.db.prepare(`
      INSERT INTO products (id, active, name, description, image, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      productData.id,
      productData.active,
      productData.name,
      productData.description,
      productData.image,
      JSON.stringify(productData.metadata)
    );
    
    return productData;
  }

  async updateProduct(productId: string, productData: any): Promise<any> {
    const stmt = this.db.prepare(`
      UPDATE products 
      SET active = ?, name = ?, description = ?, image = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      productData.active,
      productData.name,
      productData.description,
      productData.image,
      JSON.stringify(productData.metadata),
      productId
    );
    
    return this.getProduct(productId);
  }

  async deleteProduct(productId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(productId);
  }

  // Price operations
  async getPrices(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM prices WHERE active = true');
    const prices = stmt.all();
    
    return prices.map(price => ({
      ...price,
      metadata: price.metadata ? JSON.parse(price.metadata) : null
    }));
  }

  async getPrice(priceId: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM prices WHERE id = ?');
    const price = stmt.get(priceId);
    
    if (price) {
      return {
        ...price,
        metadata: price.metadata ? JSON.parse(price.metadata) : null
      };
    }
    return null;
  }

  async createPrice(priceData: any): Promise<any> {
    const stmt = this.db.prepare(`
      INSERT INTO prices (id, product_id, active, description, unit_amount, currency, type, interval, interval_count, trial_period_days, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      priceData.id,
      priceData.product_id,
      priceData.active,
      priceData.description,
      priceData.unit_amount,
      priceData.currency,
      priceData.type,
      priceData.interval,
      priceData.interval_count,
      priceData.trial_period_days,
      JSON.stringify(priceData.metadata)
    );
    
    return priceData;
  }

  async updatePrice(priceId: string, priceData: any): Promise<any> {
    const stmt = this.db.prepare(`
      UPDATE prices 
      SET active = ?, description = ?, unit_amount = ?, currency = ?, type = ?, interval = ?, interval_count = ?, trial_period_days = ?, metadata = ?
      WHERE id = ?
    `);
    
    stmt.run(
      priceData.active,
      priceData.description,
      priceData.unit_amount,
      priceData.currency,
      priceData.type,
      priceData.interval,
      priceData.interval_count,
      priceData.trial_period_days,
      JSON.stringify(priceData.metadata),
      priceId
    );
    
    return this.getPrice(priceId);
  }

  async deletePrice(priceId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM prices WHERE id = ?');
    stmt.run(priceId);
  }

  // Subscription operations
  async getSubscription(userId: string): Promise<any> {
    const stmt = this.db.prepare(`
      SELECT s.*, p.*, pr.* 
      FROM subscriptions s
      LEFT JOIN prices p ON s.price_id = p.id
      LEFT JOIN products pr ON p.product_id = pr.id
      WHERE s.user_id = ? AND s.status IN ('trialing', 'active')
    `);
    
    const subscription = stmt.get(userId);
    
    if (subscription) {
      return {
        ...subscription,
        metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null,
        prices: {
          ...subscription,
          metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null,
          products: {
            id: subscription.product_id,
            name: subscription.product_name,
            description: subscription.product_description,
            image: subscription.product_image,
            metadata: subscription.product_metadata ? JSON.parse(subscription.product_metadata) : null
          }
        }
      };
    }
    return null;
  }

  async getSubscriptions(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM subscriptions');
    const subscriptions = stmt.all();
    
    return subscriptions.map(subscription => ({
      ...subscription,
      metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null
    }));
  }

  async createSubscription(subscriptionData: any): Promise<any> {
    const stmt = this.db.prepare(`
      INSERT INTO subscriptions (id, user_id, status, metadata, price_id, quantity, cancel_at_period_end, created, current_period_start, current_period_end, ended_at, cancel_at, canceled_at, trial_start, trial_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      subscriptionData.id,
      subscriptionData.user_id,
      subscriptionData.status,
      JSON.stringify(subscriptionData.metadata),
      subscriptionData.price_id,
      subscriptionData.quantity,
      subscriptionData.cancel_at_period_end,
      subscriptionData.created,
      subscriptionData.current_period_start,
      subscriptionData.current_period_end,
      subscriptionData.ended_at,
      subscriptionData.cancel_at,
      subscriptionData.canceled_at,
      subscriptionData.trial_start,
      subscriptionData.trial_end
    );
    
    return subscriptionData;
  }

  async updateSubscription(subscriptionId: string, subscriptionData: any): Promise<any> {
    const stmt = this.db.prepare(`
      UPDATE subscriptions 
      SET status = ?, metadata = ?, quantity = ?, cancel_at_period_end = ?, current_period_start = ?, current_period_end = ?, ended_at = ?, cancel_at = ?, canceled_at = ?, trial_start = ?, trial_end = ?
      WHERE id = ?
    `);
    
    stmt.run(
      subscriptionData.status,
      JSON.stringify(subscriptionData.metadata),
      subscriptionData.quantity,
      subscriptionData.cancel_at_period_end,
      subscriptionData.current_period_start,
      subscriptionData.current_period_end,
      subscriptionData.ended_at,
      subscriptionData.cancel_at,
      subscriptionData.canceled_at,
      subscriptionData.trial_start,
      subscriptionData.trial_end,
      subscriptionId
    );
    
    return this.getSubscriptionById(subscriptionId);
  }

  private async getSubscriptionById(subscriptionId: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM subscriptions WHERE id = ?');
    const subscription = stmt.get(subscriptionId);
    
    if (subscription) {
      return {
        ...subscription,
        metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null
      };
    }
    return null;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM subscriptions WHERE id = ?');
    stmt.run(subscriptionId);
  }

  // Auth operations (simplified for SQLite)
  async signUp(email: string, password: string): Promise<any> {
    const userId = createHash('sha256').update(email + Date.now()).digest('hex');
    
    const userData = {
      id: userId,
      email,
      full_name: null,
      avatar_url: null,
      billing_address: null,
      payment_method: null
    };
    
    await this.createUser(userData);
    
    // Create session
    const sessionId = createHash('sha256').update(userId + Date.now()).digest('hex');
    const accessToken = createHash('sha256').update(sessionId).digest('hex');
    
    const sessionStmt = this.db.prepare(`
      INSERT INTO auth_sessions (id, user_id, access_token, expires_at)
      VALUES (?, ?, ?, datetime('now', '+7 days'))
    `);
    
    sessionStmt.run(sessionId, userId, accessToken);
    
    return { user: userData, session: { id: sessionId, access_token: accessToken } };
  }

  async signIn(email: string, password: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create new session
    const sessionId = createHash('sha256').update(user.id + Date.now()).digest('hex');
    const accessToken = createHash('sha256').update(sessionId).digest('hex');
    
    const sessionStmt = this.db.prepare(`
      INSERT INTO auth_sessions (id, user_id, access_token, expires_at)
      VALUES (?, ?, ?, datetime('now', '+7 days'))
    `);
    
    sessionStmt.run(sessionId, user.id, accessToken);
    
    return { user, session: { id: sessionId, access_token: accessToken } };
  }

  async signOut(): Promise<void> {
    // This would need to be implemented based on your session management
    // For now, we'll just return
  }

  async resetPassword(email: string): Promise<any> {
    // This would need to be implemented based on your email system
    // For now, we'll just return a success response
    return { success: true, message: 'Password reset email sent' };
  }

  // Webhook operations
  async handleWebhook(event: any): Promise<void> {
    // Handle webhook events based on the event type
    switch (event.type) {
      case 'product.created':
      case 'product.updated':
        await this.createProduct(event.data.object);
        break;
      case 'price.created':
      case 'price.updated':
        await this.createPrice(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.createSubscription(event.data.object);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  }

  // Close database connection
  close(): void {
    this.db.close();
  }
} 