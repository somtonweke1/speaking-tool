// Simple server entry point for Render
// Since Root Directory is set to 'src', Render will look here first

console.log('🚀 Starting SpeakingTool Backend from src/server.js...');

// Import the actual server from the backend directory
import('../backend/src/server.js')
  .then(() => {
    console.log('✅ Backend server imported and started successfully');
  })
  .catch(error => {
    console.error('❌ Failed to import backend server:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
