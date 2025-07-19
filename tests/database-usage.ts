// Example: Using PayBridge's Multi-Database Abstraction
import { getDatabaseClient, createDatabaseClient } from '../db/adapters/client';
import { DatabaseConfig } from '../db/adapters/types';

// Example 1: Using the default database (from environment variables)
async function exampleDefaultDatabase() {
  console.log('🔧 Using default database configuration...');
  
  const db = getDatabaseClient();
  console.log(`📊 Database provider: ${db.getProvider()}`);
  
  // Get all products
  const products = await db.getProducts();
  console.log(`📦 Found ${products.length} products`);
  
  // Get user subscription
  const subscription = await db.getSubscription('user_id');
  console.log('💳 User subscription:', subscription);
}

// Example 2: Using SQLite for development
async function exampleSQLiteDatabase() {
  console.log('🔧 Using SQLite database...');
  
  const config: DatabaseConfig = {
    provider: 'sqlite',
    filePath: './dev.db'
  };
  
  const db = createDatabaseClient(config);
  
  // Create a sample product
  const product = await db.createProduct({
    id: 'prod_example',
    active: true,
    name: 'Example Product',
    description: 'A sample product for testing',
    image: null,
    metadata: { category: 'test' }
  });
  
  console.log('✅ Created product:', product.name);
}

// Example 3: Using Supabase for production
async function exampleSupabaseDatabase() {
  console.log('🔧 Using Supabase database...');
  
  const config: DatabaseConfig = {
    provider: 'supabase',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
  
  const db = createDatabaseClient(config);
  
  // Get products with real-time updates
  const products = await db.getProducts();
  console.log(`📦 Found ${products.length} products in Supabase`);
}

// Example 4: Switching database providers dynamically
async function exampleDynamicDatabaseSwitch() {
  console.log('🔄 Switching database providers dynamically...');
  
  // Start with SQLite
  let db = createDatabaseClient({
    provider: 'sqlite',
    filePath: './temp.db'
  });
  
  console.log(`📊 Current provider: ${db.getProvider()}`);
  
  // Switch to Supabase (if configured)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    db = createDatabaseClient({
      provider: 'supabase',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    });
    
    console.log(`📊 Switched to provider: ${db.getProvider()}`);
  }
}

// Example 5: Database operations with error handling
async function exampleWithErrorHandling() {
  console.log('🛡️ Database operations with error handling...');
  
  const db = getDatabaseClient();
  
  try {
    // Try to get a non-existent product
    const product = await db.getProduct('non_existent_id');
    console.log('Product found:', product);
  } catch (error) {
    console.log('❌ Error getting product:', error.message);
  }
  
  try {
    // Create a product with invalid data
    await db.createProduct({
      id: 'invalid_product',
      active: true,
      name: '', // Invalid: empty name
      description: null,
      image: null,
      metadata: null
    });
  } catch (error) {
    console.log('❌ Error creating product:', error.message);
  }
}

// Example 6: Working with subscriptions
async function exampleSubscriptionOperations() {
  console.log('💳 Working with subscriptions...');
  
  const db = getDatabaseClient();
  
  // Create a subscription
  const subscription = await db.createSubscription({
    id: 'sub_example',
    user_id: 'user_123',
    status: 'active',
    metadata: { plan: 'pro' },
    price_id: 'price_pro_monthly',
    quantity: 1,
    cancel_at_period_end: false,
    created: new Date().toISOString(),
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    ended_at: null,
    cancel_at: null,
    canceled_at: null,
    trial_start: null,
    trial_end: null
  });
  
  console.log('✅ Created subscription:', subscription.id);
  
  // Update subscription status
  await db.updateSubscription(subscription.id, {
    status: 'canceled',
    canceled_at: new Date().toISOString()
  });
  
  console.log('✅ Updated subscription status');
}

// Run examples
async function runExamples() {
  console.log('🚀 PayBridge Multi-Database Examples\n');
  
  try {
    await exampleDefaultDatabase();
    console.log('\n---\n');
    
    await exampleSQLiteDatabase();
    console.log('\n---\n');
    
    await exampleSupabaseDatabase();
    console.log('\n---\n');
    
    await exampleDynamicDatabaseSwitch();
    console.log('\n---\n');
    
    await exampleWithErrorHandling();
    console.log('\n---\n');
    
    await exampleSubscriptionOperations();
    
    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Export for use in other files
export {
  exampleDefaultDatabase,
  exampleSQLiteDatabase,
  exampleSupabaseDatabase,
  exampleDynamicDatabaseSwitch,
  exampleWithErrorHandling,
  exampleSubscriptionOperations,
  runExamples
};

// Run if this file is executed directly
if (require.main === module) {
  runExamples();
} 