import { handlers } from "@/auth";

// Route handler NextAuth: GET/POST /api/auth/[...nextauth]
// (next-auth v5 menghasilkan endpoint sendiri: signin/signout/session/providers/callback)
export const { GET, POST } = handlers;