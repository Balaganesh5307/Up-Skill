const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses the MONGO_URI from environment variables
 */
const connectDB = async () => {
  // Get MongoDB URI from environment
  const mongoUri = process.env.MONGO_URI;

  // Validate that MONGO_URI is set
  if (!mongoUri) {
    console.error('❌ ERROR: MONGO_URI is not defined in environment variables');
    console.error('Please create a .env file in the server directory with:');
    console.error('MONGO_URI=mongodb://localhost:27017/resume-analyzer');
    process.exit(1);
  }

  // Debug log (safe - only shows if URI exists, not the actual value)
  console.log('🔄 MONGO_URI loaded:', mongoUri ? '✓ Present' : '✗ Missing');

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
