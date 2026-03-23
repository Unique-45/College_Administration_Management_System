/**
 * MongoDB Collection Creation Script
 * Creates all required collections for the College Administration System
 * 
 * Usage: node create-collections.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Build connection string from environment variables
const username = process.env.MONGODB_USERNAME || 'admin_user';
const password = encodeURIComponent(process.env.MONGODB_PASSWORD || '');
const cluster = process.env.MONGODB_CLUSTER || 'college-admin-cluster';
const database = process.env.MONGODB_DB || 'college_admin';

const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}.gqnlva5.mongodb.net/${database}?retryWrites=true&w=majority`;
const DB_NAME = database;

// Collection names to create
const COLLECTIONS = [
  'users',
  'classes',
  'videos',
  'attendance',
  'fee_ledgers',
  'payments',
  'payment_webhook_events',
  'events',
  'event_rsvps',
  'notifications',
  'video_watch_events',
  'analytics_daily_video',
  'analytics_daily_engagement',
];

async function createCollections() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db(DB_NAME);

    console.log(`📚 Creating ${COLLECTIONS.length} collections in database: ${DB_NAME}\n`);

    for (const collectionName of COLLECTIONS) {
      try {
        // Check if collection already exists
        const existingCollections = await db.listCollections().toArray();
        const exists = existingCollections.some(c => c.name === collectionName);

        if (exists) {
          console.log(`⏭️  Collection '${collectionName}' already exists - skipping`);
        } else {
          await db.createCollection(collectionName);
          console.log(`✅ Created collection: '${collectionName}'`);
        }
      } catch (error) {
        console.log(`❌ Error with collection '${collectionName}':`, error.message);
      }
    }

    console.log('\n✨ All collections processed!');

    // List all collections
    console.log('\n📋 Final Collections in database:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach((col, idx) => {
      console.log(`  ${idx + 1}. ${col.name}`);
    });

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🚪 Connection closed.');
  }
}

// Run the script
createCollections();
