"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import EventCard from "@/components/custom/event-card";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";

export default function BitcoinPage() {
  const subCategoryTitle = usePathname().split("/")[2];

  const user = useSession()?.data?.user;

  const [activeTab, setActiveTab] = useState<"trade" | "portfolio">("trade");
  const [timeFilter, setTimeFilter] = useState("all");

  const getEvents = async () => {
    const response = await api.get(
      `/event?subCategoryTitle=${subCategoryTitle}`
    );
    return response.data;
  };

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: errorEvents,
  } = useQuery({
    queryKey: ["events", subCategoryTitle],
    queryFn: getEvents,
  });

  const filters = [
    { value: "all", label: "All" },
    { value: "10min", label: "10 Min" },
    { value: "20min", label: "20 Min" },
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="bg-[#f5f5f5] min-h-screen mb-16 relative">
        <div className="absolute bottom-0 left-0 w-full z-0">
          <Image
            src="/waves.svg"
            alt="wave background"
            width={1280}
            height={175}
            className="mx-auto"
          />
        </div>

        <div className="container mx-auto px-6 py-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center text-[#757575] mb-6">
            <Link href="/events" className="hover:text-gray-600">
              Home
            </Link>
            <span className="mx-2">{">"}</span>
            <span className="text-[#252525] font-medium capitalize">{subCategoryTitle}</span>
          </div>

          {/* Bitcoin Header */}
          <div className="flex items-center mb-8">
            <div className="bg-[#F7931A] rounded-full p-3 mr-4 flex items-center justify-center h-10 w-10">
              <span className="text-white font-bold text-xl">₿</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 capitalize">{subCategoryTitle}</h1>
          </div>

          {/* Custom Tabs */}
          <div className="mb-4 text-center">
            <div className="flex space-x-12 border-b-2 border-gray-200 justify-center ">
              <button
                onClick={() => setActiveTab("trade")}
                className={`pb-2 w-36 relative ${
                  activeTab === "trade"
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-[#252525]"
                }`}
              >
                Trade
                {activeTab === "trade" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-black"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`pb-2 w-36 relative ${
                  activeTab === "portfolio"
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-[#252525]"
                }`}
              >
                My Portfolio
                {activeTab === "portfolio" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-black"></div>
                )}
              </button>
            </div>
          </div>

          {activeTab === "trade" && (
            <>
              {/* Time Filters */}
              <div className="flex space-x-4 items-center justify-center mb-4">
                {filters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant="outline"
                    className={`
            rounded-full px-6 py-2 font-semibold transition-all duration-200 ease-in-out
            border-2 min-w-[80px] h-10 border-none
            ${
              timeFilter === filter.value
                ? "bg-[#262626] text-white border-[#262626] hover:bg-gray-800 hover:border-gray-800 hover:text-white"
                : "bg-white text-[#545454] border-gray-300 hover:bg-gray-50 hover:border-gray-400 "
            }
          `}
                    onClick={() => setTimeFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <hr />

              {/* Prediction Cards Grid */}
              <EventCard
                events={eventsData?.data || []}
                filterExpiresInMinutes={
                  timeFilter === "all"
                    ? undefined
                    : timeFilter === "20min"
                      ? 20
                      : timeFilter === "10min"
                        ? 10
                        : undefined
                }
              />
            </>
          )}

          {user && activeTab === "portfolio" && (
            <div className="py-16 text-center">
              <div className="text-gray-500 text-lg">
                Your portfolio information will appear here
              </div>
            </div>
          )}

          {!user && activeTab === "portfolio" && (
            <div className="py-16">
              <div className="text-lg flex items-center justify-center gap-4 text-[#262626]">
                <Image src="/auth.avif" alt="auth" width={148} height={148} />
                <div className="py-2 flex flex-col gap-3 ">
                  <h2 className="text-3xl font-semibold">
                    Login to you account
                  </h2>
                  <p>You will be able to see your trades after logging in</p>
                  <Button className="text-bold text-white w-26">Login</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
}
