// components/SignInButton.tsx
import React from "react";
// import { authClient, signIn } from "../lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { signIn } from "@/lib/auth-client";

const SignInButton: React.FC = () => {
  const handleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google", // Change to your desired provider
        callbackURL: "/profile", // Redirect after successful sign-in
        errorCallbackURL: "/error", // Redirect after failed sign-in
      });
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return <Button onClick={handleSignIn}>Sign In</Button>;
};

export default SignInButton;
