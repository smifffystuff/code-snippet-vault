/**
 * Migration script to add userEmail field to existing snippets
 * This will attempt to fetch user email from Clerk for existing snippets
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// Import the updated Snippet model
const Snippet = require('./src/models/Snippet');

async function migrateUserEmails() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find snippets without userEmail
    const snippetsWithoutEmail = await Snippet.find({ 
      $or: [
        { userEmail: { $exists: false } },
        { userEmail: null },
        { userEmail: '' }
      ]
    });

    console.log(`📊 Found ${snippetsWithoutEmail.length} snippets without userEmail`);

    if (snippetsWithoutEmail.length === 0) {
      console.log('✅ All snippets already have userEmail field. No migration needed.');
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const snippet of snippetsWithoutEmail) {
      try {
        // Try to get user info from Clerk
        const user = await clerkClient.users.getUser(snippet.userId);
        const email = user.emailAddresses?.[0]?.emailAddress || 'unknown@example.com';
        
        // Update the snippet with the email
        await Snippet.updateOne(
          { _id: snippet._id },
          { userEmail: email }
        );
        
        console.log(`✅ Updated snippet ${snippet._id} with email: ${email}`);
        updated++;
      } catch (error) {
        console.warn(`⚠️ Could not get email for user ${snippet.userId}, using default`);
        
        // Use default email if we can't fetch from Clerk
        await Snippet.updateOne(
          { _id: snippet._id },
          { userEmail: 'unknown@example.com' }
        );
        
        failed++;
      }
    }

    console.log(`🎉 Migration completed:`);
    console.log(`   - Updated with real emails: ${updated}`);
    console.log(`   - Updated with default email: ${failed}`);

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
  migrateUserEmails()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateUserEmails;