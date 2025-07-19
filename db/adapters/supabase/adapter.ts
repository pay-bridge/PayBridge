import { DatabaseClient, DatabaseConfig } from '../types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/core/types_db';

export class SupabaseAdapter implements DatabaseClient {
  private client: any;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.client = createSupabaseClient<Database>(
      config.supabaseUrl!,
      config.supabaseKey!
    );
  }

  // User operations
  async getUser(): Promise<any> {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error) throw error;
    return user;
  }

  async createUser(userData: any): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Customer operations
  async getCustomer(userId: string): Promise<any> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createCustomer(customerData: any): Promise<any> {
    const { data, error } = await this.client
      .from('customers')
      .insert([customerData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCustomer(userId: string, customerData: any): Promise<any> {
    const { data, error } = await this.client
      .from('customers')
      .update(customerData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Product operations
  async getProducts(): Promise<any[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*, prices(*)')
      .eq('active', true)
      .eq('prices.active', true)
      .order('metadata->index')
      .order('unit_amount', { referencedTable: 'prices' });
    
    if (error) throw error;
    return data || [];
  }

  async getProduct(productId: string): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .select('*, prices(*)')
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createProduct(productData: any): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProduct(productId: string, productData: any): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await this.client
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
  }

  // Price operations
  async getPrices(): Promise<any[]> {
    const { data, error } = await this.client
      .from('prices')
      .select('*, products(*)')
      .eq('active', true);
    
    if (error) throw error;
    return data || [];
  }

  async getPrice(priceId: string): Promise<any> {
    const { data, error } = await this.client
      .from('prices')
      .select('*, products(*)')
      .eq('id', priceId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createPrice(priceData: any): Promise<any> {
    const { data, error } = await this.client
      .from('prices')
      .insert([priceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePrice(priceId: string, priceData: any): Promise<any> {
    const { data, error } = await this.client
      .from('prices')
      .update(priceData)
      .eq('id', priceId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePrice(priceId: string): Promise<void> {
    const { error } = await this.client
      .from('prices')
      .delete()
      .eq('id', priceId);
    
    if (error) throw error;
  }

  // Subscription operations
  async getSubscription(userId: string): Promise<any> {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .eq('user_id', userId)
      .in('status', ['trialing', 'active'])
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async getSubscriptions(): Promise<any[]> {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*, prices(*, products(*))');
    
    if (error) throw error;
    return data || [];
  }

  async createSubscription(subscriptionData: any): Promise<any> {
    const { data, error } = await this.client
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSubscription(subscriptionId: string, subscriptionData: any): Promise<any> {
    const { data, error } = await this.client
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    const { error } = await this.client
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);
    
    if (error) throw error;
  }

  // Auth operations
  async signUp(email: string, password: string): Promise<any> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string): Promise<any> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string): Promise<any> {
    const { data, error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  }

  // Webhook operations
  async handleWebhook(event: any): Promise<void> {
    // This would typically be handled by the existing webhook handlers
    // For now, we'll just log the event
    console.log('Webhook event received:', event.type);
  }

  // Get the underlying Supabase client for advanced operations
  getClient() {
    return this.client;
  }
} 