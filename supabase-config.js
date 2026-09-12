window.challengeArenaSupabase = window.supabase.createClient(
  'https://lwrjzgvbdxtpqhiranwl.supabase.co',
  'sb_publishable_lvkjbodUIwnzF-clrwpFug_U7aBzSHZ',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
