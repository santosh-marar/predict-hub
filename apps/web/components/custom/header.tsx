"use client"

import { signIn } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {

  const pathname = usePathname();

   const handleSignIn = async () => {
      try {
        await signIn.social({
          provider: "google", 
          callbackURL: "/dashboard", 
          errorCallbackURL: "/error", 
        });
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    };

  return (
    <header className="w-full bg-white">
      <div className="max-w-7xl mx-auto ">
        <div className="flex items-center justify-between px-6 py-4 px-6 py-4 border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="/logo.avif" alt="logo" width={100} height={100} />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-[#262626] hover:text-black text-sm"
            >
              Trading
            </Link>
            <Link
              href="#"
              className="text-[#262626] hover:text-black text-sm"
            >
              Team 11
            </Link>
            <Link
              href="#"
              className="text-[#262626] hover:text-black text-sm"
            >
              Read
            </Link>
            <Link
              href="#"
              className="text-[#262626] hover:text-black text-sm"
            >
              Trust & Safety
            </Link>
            <Link
              href="#"
              className="text-[#262626] hover:text-black text-sm"
            >
              Careers
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <div className="text-right text-xs text-gray-600">
              <div>For 18 years and</div>
              <div>above only</div>
            </div>
            <Button
              variant="outline"
              asChild
              className="text-black border-gray-300  rounded-xs"
            >
              <Link href="#">Download App</Link>
            </Button>
            <Button
              asChild
              className="bg-[#262626] cursor-pointer text-white hover:bg-gray-800 rounded-xs"
            >
              {pathname === "/" ? (
                <Link href="/events">Trade Online</Link>
              ) : (
                <p onClick={handleSignIn}>Login/Signup</p>
              )}
            </Button>
            {/* <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-sm">🔗</span>
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
}
