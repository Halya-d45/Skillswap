import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas Database
 * Uses the connection string provided in the MONGO_URI environment variable
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn(
        '⚠️  MONGO_URI is not set in backend/.env. Database connection skipped. Please configure your MongoDB Atlas URI in backend/.env'
      );
      return;
    }

    if (mongoUri.includes('<') && mongoUri.includes('>')) {
      console.warn(
        '⚠️  Notice: Your MONGO_URI in backend/.env still contains placeholder brackets like "<db_password>".'
      );
      console.warn(
        '👉 Please replace "<db_password>" with your actual MongoDB Atlas user password in backend/.env'
      );
    }

    const conn = await mongoose.connect(mongoUri, {
      family: 4, // Force IPv4 to prevent Windows IPv6 DNS/TLS handshake alerts
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (
      error.message.includes('authentication failed') ||
      error.message.includes('bad auth')
    ) {
      console.warn(
        '👉 Tip: Database username or password is incorrect in backend/.env.'
      );
      console.warn(
        '   1. Open MongoDB Atlas > Security > Database Access.'
      );
      console.warn(
        '   2. Click "Edit" on your database user > "Edit Password" to set a known password.'
      );
      console.warn(
        '   3. Update MONGO_URI in backend/.env with the exact password (without < > brackets).'
      );
    } else {
      console.warn(
        '👉 Tip: Ensure your current IP is whitelisted in MongoDB Atlas Network Access (Security > Network Access > Allow Access from Anywhere 0.0.0.0/0).'
      );
    }
  }
};

export default connectDB;
