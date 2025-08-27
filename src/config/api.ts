import { supabase, User, Session, Progress } from './supabase';

// Supabase-based API Configuration
export const API_CONFIG = {
  // Supabase backend
  SUPABASE_URL: 'https://kjvabvlsygwcthxxscos.supabase.co',
  
  // API endpoints (using Supabase RPC functions)
  ENDPOINTS: {
    HEALTH: '/health',
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      PROFILE: '/auth/profile',
      LOGOUT: '/auth/logout'
    },
    USERS: {
      PROGRESS: '/users/progress',
      SESSIONS: '/users/sessions',
      STATISTICS: '/users/statistics'
    },
    SESSIONS: {
      CREATE: '/sessions/create',
      ANALYTICS: '/sessions/analytics',
      INSIGHTS: '/sessions/insights'
    }
  }
};

// Supabase Authentication
export const SupabaseAuth = {
  // Register new user
  register: async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          user: data.user,
          message: 'Please check your email to confirm your account'
        };
      }

      // Try to create user profile in our custom table, but don't fail if table doesn't exist
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                name,
                email,
                created_at: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.log('Users table not accessible, skipping profile creation');
          }
        } catch (error) {
          console.log('Profile creation failed, continuing with auth');
        }
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔐 Supabase auth response:', { data, error });

      if (error) {
        console.log('❌ Supabase auth error:', error.message);
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          return { success: false, message: 'Email not confirmed. Please check your email and click the confirmation link.' };
        } else if (error.message.includes('Invalid login credentials')) {
          return { success: false, message: 'Invalid email or password. Please check your credentials.' };
        } else {
          throw error;
        }
      }

      console.log('✅ Supabase auth successful, user:', data.user);

      // Try to get user profile, but don't fail if table doesn't exist
      try {
        console.log('🔍 Attempting to fetch user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('🔍 Profile fetch result:', { profile, profileError });

        if (profileError) {
          // Table doesn't exist or other error - create a temporary user object
          console.log('⚠️ Users table not accessible, using temporary profile');
          return { 
            success: true, 
            user: {
              id: data.user.id,
              name: data.user.user_metadata?.name || 'User',
              email: data.user.email,
              created_at: new Date().toISOString()
            }
          };
        }

        console.log('✅ Profile fetched successfully:', profile);
        return { success: true, user: profile };
      } catch (profileError) {
        // Fallback: create temporary user object
        console.log('⚠️ Profile error, using fallback user object:', profileError);
        return { 
          success: true, 
          user: {
            id: data.user.id,
            name: data.user.user_metadata?.name || 'User',
            email: data.user.email,
            created_at: new Date().toISOString()
          }
        };
      }
    } catch (error: any) {
      console.log('💥 Login function error:', error);
      return { success: false, message: error.message };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    } catch (error) {
      return null;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  // Test Supabase connection
  testConnection: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  }
};

// Supabase Session Management
export const SupabaseSessions = {
  // Save session
  saveSession: async (session: Omit<Session, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          ...session,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Get user sessions
  getUserSessions: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, sessions: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Get all sessions (for admin)
  getAllSessions: async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, sessions: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
};

// Supabase Progress Management
export const SupabaseProgress = {
  // Get user progress
  getProgress: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (!data) {
        // Create default progress if none exists
        const defaultProgress = {
          user_id: userId,
          total_sessions: 0,
          average_score: 0,
          best_score: 0,
          streak: 0,
          updated_at: new Date().toISOString()
        };

        const { data: newProgress, error: createError } = await supabase
          .from('progress')
          .insert([defaultProgress])
          .select()
          .single();

        if (createError) throw createError;
        return { success: true, progress: newProgress };
      }

      return { success: true, progress: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // Update progress
  updateProgress: async (userId: string, updates: Partial<Progress>) => {
    try {
      const { data, error } = await supabase
        .from('progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, progress: data };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
};

// Fallback to local storage if Supabase fails
export const LocalFallback = {
  // Check if we should use local storage
  shouldUseLocal: () => {
    return !navigator.onLine || localStorage.getItem('useLocalStorage') === 'true';
  },

  // Get local data
  getLocalData: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Set local data
  setLocalData: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
};
