import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Klien admin (service role) — HANYA untuk sisi server. Dipakai untuk
// membuat user dengan email langsung terkonfirmasi (register auto-confirm).
// Mengembalikan null bila SUPABASE_SERVICE_ROLE_KEY belum diset.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}