import { createAuthClient } from "better-auth/react";
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
  signOut,
}: {
  // @ts-ignore
  signIn;

  // @ts-ignore
  signUp;

  // @ts-ignore
  useSession;

  // @ts-ignore
  signOut;
} = authClient;

export const handleSignIn = async () => {
  try {
    await signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000",
      errorCallbackURL: "/error",
    });
  } catch (error) {
    console.error("Sign-in error:", error);
  }
};

export const handleSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error("Sign-out error:", error);
  }
};
