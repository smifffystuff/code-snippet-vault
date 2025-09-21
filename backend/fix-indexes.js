const mongoose = require('mongoose');
require('dotenv').config();

const dropAndRecreateIndexes = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-snippet-vault';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get the Snippet collection
    const db = mongoose.connection.db;
    const collection = db.collection('snippets');

    // Check existing indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => console.log('  -', index.name, ':', JSON.stringify(index.key)));

    // Drop the text index if it exists
    try {
      await collection.dropIndex({ title: 'text', description: 'text' });
      console.log('🗑️  Dropped old text index');
    } catch (error) {
      console.log('ℹ️  No existing text index to drop (this is okay)');
    }

    // Create the new text index with default_language: 'none'
    await collection.createIndex(
      { title: 'text', description: 'text' }, 
      { default_language: 'none' }
    );
    console.log('✅ Created new text index with default_language: none');

    // Verify the new index
    console.log('📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => console.log('  -', index.name, ':', JSON.stringify(index.key)));

    console.log('🎉 Index update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
};

dropAndRecreateIndexes();