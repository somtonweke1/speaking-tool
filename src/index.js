// Entry point for Render (since Root Directory is set to 'src')
console.log('🚀 Starting SpeakingTool Backend from src/index.js...');

// Import the server from the backend directory
import('../backend/src/server.js')
  .then(() => console.log('✅ Server started successfully'))
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
