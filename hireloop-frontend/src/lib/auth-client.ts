import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth"

// Keep the client URL relative by default so auth works on any deployment.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
   plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
})

export const { signIn, signUp, useSession, signOut } = authClient
