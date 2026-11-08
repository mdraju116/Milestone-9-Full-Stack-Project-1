import { createAuthClient } from "better-auth/react"

// Keep the client URL relative by default so auth works on any deployment.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
})

export const { signIn, signUp, useSession, signOut } = authClient
