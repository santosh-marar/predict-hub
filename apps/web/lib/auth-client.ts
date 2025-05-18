import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

// Create a type for the auth client
type BetterAuthClient = ReturnType<typeof createAuthClient>;

// Add the type annotation
export const authClient: BetterAuthClient = createAuthClient({
  baseURL: "http://localhost:8080",
  plugins: [adminClient()],
});

export const {
  signIn,
  signUp,
  useSession,
}: {
  // @ts-ignore
  signIn,
  // @ts-ignore
  signUp,
  useSession: BetterAuthClient["useSession"];
} = authClient;
