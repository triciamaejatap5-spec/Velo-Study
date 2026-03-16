import { createClient } from "@supabase/supabase-js";

// --- REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS ---
const SUPABASE_URL = "https://faonelmriqlvgcticlsx.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_eXVoMqmHb6VOBet4NSgztA_xHtXPfa6";
// -----------------------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
