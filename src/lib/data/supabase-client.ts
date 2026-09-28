import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase istemcisi — yalnızca sunucuda.
 *
 * `service_role` anahtarı RLS'i baypas eder ve tarayıcıya asla
 * gönderilmez. `server-only` içe aktarımı, bu modülün yanlışlıkla bir
 * client component'e sızmasını derleme zamanında hata haline getirir.
 */

export const supabaseUrl = process.env.SUPABASE_URL ?? "";
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Supabase yapılandırılmışsa true; değilse JSON deposu kullanılır. */
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== "" && supabaseServiceRoleKey !== "";
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase yapılandırılmamış: SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.",
    );
  }

  client ??= createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Sunucuda oturum yok: her istek service_role ile gider.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}
