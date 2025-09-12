"use client";

import SignInButton from "@/components/sign-google";
import { signUp, useSession } from "@/lib/auth-client";
// import { authClient } from "@/lib/auth-client";
// import { signUp } from "@/lib/auth-client";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // const { data } = useSession();
  // console.log(data);

  const handleSignUp = async () => {
    setLoading(true);
    signUp
      .email(
        {
          email,
          password,
          name,
          image,
          callbackURL: "/profile", // Or wherever you want to redirect after verify
        },
        {
          onSuccess: () => {
            setLoading(false);
            alert("Check your email for verification link.");
            // window.location.href = "/dashboard"; // Or redirect to sign-in
          },
        },
      )
      .catch((error: any) => {
        console.error("Error signing up:", error);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="w-full mb-2 p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="w-full mb-2 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          className="w-full mb-2 p-2 border rounded"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={image}
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setImage(e.target.value)}
        />
        <button
          onClick={handleSignUp}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <SignInButton />
      </div>
    </>
  );
}
