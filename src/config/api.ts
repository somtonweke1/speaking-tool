// API Configuration
export const API_CONFIG = {
  // Production backend URL
  BASE_URL: 'https://speaking-tool.onrender.com',
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      PROFILE: '/api/auth/profile',
      CHANGE_PASSWORD: '/api/auth/change-password',
      DELETE_ACCOUNT: '/api/auth/delete-account'
    },
    USERS: {
      PROGRESS: '/api/users/progress',
      SESSIONS: '/api/users/sessions',
      STATISTICS: '/api/users/statistics'
    },
    SESSIONS: {
      ANALYTICS: '/api/sessions/analytics',
      INSIGHTS: '/api/sessions/insights',
      LEADERBOARD: '/api/sessions/leaderboard',
      EXPORT: '/api/sessions/export'
    }
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
