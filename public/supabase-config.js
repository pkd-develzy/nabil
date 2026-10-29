/**
 * Konfigurasi Supabase untuk Undangan Pernikahan
 */
window.SUPABASE_CONFIG = {
  // Supabase Project URL
  // Diset null karena menggunakan database D1 (mencegah ERR_NAME_NOT_RESOLVED)
  url: null,
  
  // Supabase Anon / Publishable Key
  anonKey: null,
  
  // Storage Bucket untuk foto mempelai
  bucketName: 'wedding-media'
};

// Inisialisasi Supabase Client (Singleton Pattern)
window._supabaseInstance = null;
window.getSupabaseClient = function() {
  if (window._supabaseInstance) {
    return window._supabaseInstance;
  }
  
  var url = window.SUPABASE_CONFIG.url || (typeof localStorage !== 'undefined' ? localStorage.getItem('wedding_supabase_url') : null);
  var key = window.SUPABASE_CONFIG.anonKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('wedding_supabase_key') : null);
  
  if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      window._supabaseInstance = window.supabase.createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
      return window._supabaseInstance;
    } catch (e) {
      console.warn('Gagal menginisialisasi Supabase client:', e);
      return null;
    }
  }
  return null;
};
