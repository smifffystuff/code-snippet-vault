/**
 * Migration script to add userId field to existing snippets
 * This should be run once after deploying the updated model
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Snippet = require('./src/models/Snippet');

async function migrateSnippets() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if there are any snippets without userId
    const snippetsWithoutUserId = await Snippet.countDocuments({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });

    console.log(`📊 Found ${snippetsWithoutUserId} snippets without userId`);

    if (snippetsWithoutUserId === 0) {
      console.log('✅ All snippets already have userId field. No migration needed.');
      return;
    }

    // Option 1: Delete existing snippets (since we don't know which user they belong to)
    console.log('⚠️  WARNING: Existing snippets will be deleted since we cannot assign them to users');
    console.log('This is a one-time migration. New snippets will be properly associated with users.');
    
    const result = await Snippet.deleteMany({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });

    console.log(`🗑️  Deleted ${result.deletedCount} snippets without userId`);
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateSnippets()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateSnippets;