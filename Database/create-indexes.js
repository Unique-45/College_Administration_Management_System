/**
 * MongoDB Index Creation Script
 * Creates all required indexes for the College Administration System
 * 
 * Usage: node create-indexes.js
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

// Index definitions organized by collection
const INDEXES = {
  payments: [
    { keys: { transaction_id: 1 }, options: { unique: true, sparse: true } },
    { keys: { order_id: 1 }, options: { unique: true, sparse: true } },
    { keys: { student_id: 1, status: 1, created_at: -1 }, options: {} },
    { keys: { student_id: 1, created_at: -1 }, options: {} },
    { keys: { status: 1, created_at: -1 }, options: {} },
  ],
  fee_ledgers: [
    { keys: { student_id: 1, academic_year: 1 }, options: { unique: true } },
    { keys: { student_id: 1, status: 1, due_date: 1 }, options: {} },
  ],
  payment_webhook_events: [
    { keys: { event_id: 1 }, options: { unique: true } },
    { keys: { gateway: 1, created_at: -1 }, options: {} },
  ],
  video_watch_events: [
    { keys: { video_id: 1, watched_at: -1 }, options: {} },
    { keys: { student_id: 1, watched_at: -1 }, options: {} },
    { keys: { class_id: 1, watched_at: -1 }, options: {} },
  ],
  analytics_daily_video: [
    { keys: { date: 1, class_id: 1, video_id: 1 }, options: { unique: true } },
    { keys: { date: 1, subject: 1 }, options: {} },
    { keys: { video_id: 1, date: -1 }, options: {} },
  ],
  analytics_daily_engagement: [
    { keys: { date: 1, class_id: 1 }, options: { unique: true } },
    { keys: { date: 1, subject: 1 }, options: {} },
  ],
  event_rsvps: [
    { keys: { event_id: 1, user_id: 1 }, options: { unique: true } },
  ],
  notifications: [
    { keys: { user_id: 1, read: 1, created_at: -1 }, options: {} },
    { keys: { type: 1, created_at: -1 }, options: {} },
  ],
};

async function createIndexes() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db(DB_NAME);

    let totalIndexes = 0;
    const indexSummary = {};

    // Iterate through each collection and create indexes
    for (const [collectionName, indexes] of Object.entries(INDEXES)) {
      try {
        const collection = db.collection(collectionName);
        console.log(`\n📊 Creating indexes for '${collectionName}':`);

        indexSummary[collectionName] = 0;

        for (const indexDef of indexes) {
          try {
            const indexName = await collection.createIndex(indexDef.keys, indexDef.options);
            console.log(`  ✅ Index created: ${indexName}`);
            totalIndexes++;
            indexSummary[collectionName]++;
          } catch (error) {
            console.log(`  ⚠️  Index creation note: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error with collection '${collectionName}':`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ All indexes processed!\n');

    console.log('📋 Index Summary:');
    for (const [collection, count] of Object.entries(indexSummary)) {
      console.log(`  ${collection}: ${count} indexes created`);
    }
    console.log(`\nTotal indexes created: ${totalIndexes}`);

    // List all indexes for verification
    console.log('\n📊 Verification: All Indexes in Database:\n');
    for (const collectionName of Object.keys(INDEXES)) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.listIndexes().toArray();
        console.log(`${collectionName} (${indexes.length} indexes):`);
        indexes.forEach((idx, i) => {
          const keyStr = JSON.stringify(idx.key);
          console.log(`  ${i}. ${keyStr}`);
        });
        console.log();
      } catch (error) {
        console.log(`  Error listing indexes: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🚪 Connection closed.');
  }
}

// Run the script
createIndexes();
