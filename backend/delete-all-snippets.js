/**
 * Script to delete all snippets from the database
 * Use with caution - this will permanently delete all snippet data!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Snippet = require('./src/models/Snippet');

async function deleteAllSnippets() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count existing snippets
    const count = await Snippet.countDocuments();
    console.log(`📊 Found ${count} snippets in the database`);

    if (count === 0) {
      console.log('🎉 No snippets to delete!');
      return;
    }

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`⚠️  Are you sure you want to delete ALL ${count} snippets? This cannot be undone! (yes/no): `, resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      return;
    }

    // Delete all snippets
    console.log('🗑️  Deleting all snippets...');
    const result = await Snippet.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} snippets`);
    console.log('🎉 Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error deleting snippets:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run deletion if this script is executed directly
if (require.main === module) {
  deleteAllSnippets()
    .then(() => {
      console.log('🎉 Delete script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Delete script failed:', error);
      process.exit(1);
    });
}

module.exports = deleteAllSnippets;