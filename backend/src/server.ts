import dotenv from 'dotenv';
// Load .env BEFORE any other imports that need env vars
dotenv.config();

import app from './app';
import { testConnection } from './config/database';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  // Test database connection on startup
  try {
    await testConnection();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    console.error('   Make sure MySQL is running and .env credentials are correct.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 HostelCare server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
