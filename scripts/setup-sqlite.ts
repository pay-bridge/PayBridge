#!/usr/bin/env tsx

import { createDatabaseClient } from '../db/adapters/client';
import { DatabaseConfig } from '../db/adapters/types';

async function setupSQLite() {
  console.log('🚀 Setting up SQLite database for PayBridge...');

  // Configure SQLite
  const config: DatabaseConfig = {
    provider: 'sqlite',
    filePath: './paybridge.db'
  };

  try {
    // Create database client
    const db = createDatabaseClient(config);
    
    console.log('✅ Database client created successfully');

    // Create sample products
    const sampleProducts = [
      {
        id: 'prod_basic',
        active: true,
        name: 'Basic Plan',
        description: 'Perfect for small projects and startups',
        image: null,
        metadata: { index: 0, features: ['Basic support', 'Up to 1000 transactions'] }
      },
      {
        id: 'prod_pro',
        active: true,
        name: 'Pro Plan',
        description: 'Ideal for growing businesses',
        image: null,
        metadata: { index: 1, features: ['Priority support', 'Up to 10000 transactions', 'Advanced analytics'] }
      },
      {
        id: 'prod_enterprise',
        active: true,
        name: 'Enterprise Plan',
        description: 'For large-scale applications',
        image: null,
        metadata: { index: 2, features: ['24/7 support', 'Unlimited transactions', 'Custom integrations'] }
      }
    ];

    console.log('📦 Creating sample products...');
    for (const product of sampleProducts) {
      await db.createProduct(product);
      console.log(`  ✅ Created product: ${product.name}`);
    }

    // Create sample prices
    const samplePrices = [
      {
        id: 'price_basic_monthly',
        product_id: 'prod_basic',
        active: true,
        description: 'Basic Plan - Monthly',
        unit_amount: 999, // $9.99
        currency: 'USD',
        type: 'recurring',
        interval: 'month',
        interval_count: 1,
        trial_period_days: 7,
        metadata: { index: 0 }
      },
      {
        id: 'price_basic_yearly',
        product_id: 'prod_basic',
        active: true,
        description: 'Basic Plan - Yearly',
        unit_amount: 9999, // $99.99
        currency: 'USD',
        type: 'recurring',
        interval: 'year',
        interval_count: 1,
        trial_period_days: 7,
        metadata: { index: 1 }
      },
      {
        id: 'price_pro_monthly',
        product_id: 'prod_pro',
        active: true,
        description: 'Pro Plan - Monthly',
        unit_amount: 2999, // $29.99
        currency: 'USD',
        type: 'recurring',
        interval: 'month',
        interval_count: 1,
        trial_period_days: 14,
        metadata: { index: 2 }
      },
      {
        id: 'price_pro_yearly',
        product_id: 'prod_pro',
        active: true,
        description: 'Pro Plan - Yearly',
        unit_amount: 29999, // $299.99
        currency: 'USD',
        type: 'recurring',
        interval: 'year',
        interval_count: 1,
        trial_period_days: 14,
        metadata: { index: 3 }
      },
      {
        id: 'price_enterprise_monthly',
        product_id: 'prod_enterprise',
        active: true,
        description: 'Enterprise Plan - Monthly',
        unit_amount: 9999, // $99.99
        currency: 'USD',
        type: 'recurring',
        interval: 'month',
        interval_count: 1,
        trial_period_days: 30,
        metadata: { index: 4 }
      },
      {
        id: 'price_enterprise_yearly',
        product_id: 'prod_enterprise',
        active: true,
        description: 'Enterprise Plan - Yearly',
        unit_amount: 99999, // $999.99
        currency: 'USD',
        type: 'recurring',
        interval: 'year',
        interval_count: 1,
        trial_period_days: 30,
        metadata: { index: 5 }
      }
    ];

    console.log('💰 Creating sample prices...');
    for (const price of samplePrices) {
      await db.createPrice(price);
      console.log(`  ✅ Created price: ${price.description}`);
    }

    // Create sample user
    const sampleUser = {
      id: 'user_demo',
      email: 'demo@paybridge.com',
      full_name: 'Demo User',
      avatar_url: null,
      billing_address: null,
      payment_method: null
    };

    console.log('👤 Creating sample user...');
    await db.createUser(sampleUser);
    console.log(`  ✅ Created user: ${sampleUser.email}`);

    console.log('\n🎉 SQLite database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  • Database file: ${config.filePath}`);
    console.log(`  • Products created: ${sampleProducts.length}`);
    console.log(`  • Prices created: ${samplePrices.length}`);
    console.log(`  • Sample user: ${sampleUser.email}`);
    
    console.log('\n🚀 You can now start the application with:');
    console.log('  npm run dev');
    
    console.log('\n💡 To switch back to Supabase, set DATABASE_PROVIDER=supabase in your .env file');

  } catch (error) {
    console.error('❌ Error setting up SQLite database:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupSQLite();
} 