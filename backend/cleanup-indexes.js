const mongoose = require('mongoose');
require('dotenv').config();

const cleanupIndexes = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('snippets');

    // Get all indexes
    console.log('📋 Listing current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    // Drop all text indexes that might be causing issues
    for (const index of indexes) {
      if (index.name.includes('text') || index.name === 'title_text_description_text') {
        try {
          console.log(`🗑️  Dropping problematic index: ${index.name}`);
          await collection.dropIndex(index.name);
        } catch (error) {
          console.log(`⚠️  Could not drop index ${index.name}:`, error.message);
        }
      }
    }

    console.log('✅ Index cleanup complete');
    console.log('🔄 The application will now use regex-based search instead of text indexes');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

cleanupIndexes();