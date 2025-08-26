import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎤 SpeakingTool
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered Public Speaking Coach
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            ✅ App is Working!
          </h2>
          <p className="text-gray-600">
            If you can see this message, your React app is successfully deployed on Vercel!
          </p>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              🚀 Deployment Status: SUCCESS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
