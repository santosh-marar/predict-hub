"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleSignIn, handleSignOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const session = useSession();
  const user = session?.data?.user;

  const [wallet, setWallet] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/wallet/${user?.id}`,
          {
            credentials: "include",
          },
        );
        const data = await response.json();
        setWallet(data?.data);
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // @ts-ignore
  const userBalance = wallet?.balance;

  if (user) {
    return (
      <header className="w-full bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between  py-2 border-b border-gray-200">
            {/* Logo */}
            <div className="flex items-center">
              <Image src="/logo.avif" alt="logo" width={120} height={120} />
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-6">
              <button>
                <Link href="/events">
                  <span className="flex flex-col justify-center  items-center text-[#262626] hover:text-black gap-0">
                    {pathname === "/events/portfolio" ? (
                      <Image
                        src="/home-active.svg"
                        alt="home"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image
                        src="/home.svg"
                        alt="home"
                        width={20}
                        height={20}
                      />
                    )}
                    <span className="text-sm">Home</span>
                  </span>
                </Link>
              </button>

              <button>
                <Link href="/events/portfolio">
                  <span className="flex flex-col justify-center  items-center text-[#262626] hover:text-black gap-0">
                    {pathname === "/events/portfolio" ? (
                      <Image
                        src="/portfolio-active.svg"
                        alt="portfolio"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image
                        src="/portfolio.svg"
                        alt="portfolio"
                        width={20}
                        height={20}
                      />
                    )}
                    <span className="text-sm">Portfolio</span>
                  </span>
                </Link>
              </button>

              {/* Wallet */}
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-[#f5f5f5] text-[#262626] hover:text-black"
              >
                <span className="flex justify-center  items-center gap-4">
                  <Image
                    src="/wallet.svg"
                    alt="wallet"
                    width={20}
                    height={20}
                  />
                  {/* @ts-ignore */}
                  <span className="text-sm font-medium">
                    ₹ {Number(userBalance ?? 0).toFixed(2)}
                  </span>
                </span>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 outline-none">
                    <span>
                      <Image
                        src="/Silhouette.avif"
                        alt="profile"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 shadow-md border-none flex p-0 rounded-xl flex-col"
                >
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer w-full h-13 "
                  >
                    <Image
                      src="/logout.svg"
                      alt="profile"
                      width={20}
                      height={20}
                    />
                    <button className="text-sm font-medium text-[#262626]">
                      Logout
                    </button>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem className="w-full h-10">
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="/logo.avif" alt="logo" width={120} height={120} />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-[#262626] hover:text-black text-sm"
            >
              Trading
            </Link>
            <Link href="#" className="text-[#262626] hover:text-black text-sm">
              Team 11
            </Link>
            <Link href="#" className="text-[#262626] hover:text-black text-sm">
              Read
            </Link>
            <Link href="#" className="text-[#262626] hover:text-black text-sm">
              Trust & Safety
            </Link>
            <Link href="#" className="text-[#262626] hover:text-black text-sm">
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
              className="text-black border-gray-300 rounded-xs"
            >
              <Link href="#">Download App</Link>
            </Button>
            {pathname.trim() === "/" ? (
              <Link href="/events">
                <Button className="bg-[#262626] cursor-pointer text-white hover:bg-gray-800 rounded-xs">
                  Trade Online
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-[#262626] cursor-pointer text-white hover:bg-gray-800 rounded-xs"
              >
                Login/Signup
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
