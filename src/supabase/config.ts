/**
 * Supabase configuration
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  mockMode: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const mockMode = import.meta.env.VITE_MOCK_SUPABASE === 'true' || !url || !anonKey;

  if (mockMode) {
    console.log('🧪 Supabase Mock Mode: Using local mock data');
  } else {
    console.log('✅ Supabase: Connected to real instance');
  }

  return {
    url,
    anonKey,
    mockMode,
  };
}

