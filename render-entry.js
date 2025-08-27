// Simple entry point for Render
console.log('🚀 Starting SpeakingTool Backend...');

// Import the server
import('./backend/src/server.js')
  .then(() => console.log('✅ Server started successfully'))
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
