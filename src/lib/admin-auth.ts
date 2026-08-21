import { auth } from "@/auth";

// Role yang dianggap admin/staf kelurahan.
export const ADMIN_ROLES = ["super_admin", "lurah", "sekretaris", "petugas"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role?: string | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

// Ambil session admin dari NextAuth. Kalau belum login / bukan admin → null.
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!isAdminRole(session.user.role)) return null;
  return session;
}
