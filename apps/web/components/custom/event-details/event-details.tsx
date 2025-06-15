"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Share2, Settings, ArrowLeftRight, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import ChartSettings from "./chart-settings";
import ProbabilityChart from "./probability-chart";
import Image from "next/image";
import DownloadApp from "./download-app";
import AboutEvent from "./about-event";
import { useSession } from "@/lib/auth-client";
import TradingSidebar from "./trading-sidebar";
import OrderBookTabs from "./order-book-tab";

export default function EventDetails() {
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");
  const [showSettings, setShowSettings] = useState(false);
  const [showGrids, setShowGrids] = useState(true);
  const [showTradeVolume, setShowTradeVolume] = useState(true);
  const [activeBarData, setActiveBarData] = useState<{
    time: string;
    yes: number;
    no: number;
  } | null>(null);

  const session=useSession();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };


  const toggleOption = () => {
    setSelectedOption(selectedOption === "yes" ? "no" : "yes");
    setActiveBarData(null); // Clear bar data when toggling
  };

  const handleBarClick = (data: { time: string; yes: number; no: number }) => {
    setActiveBarData(data);
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl flex gap-8 relative">
      {/* Main Content - Left Side */}
      <div className="max-w-3xl flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#262626]">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-[#262626]">Event Details</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Image src="/share-icon.svg" alt="share" width={16} height={16} />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        {/* Event Title with Bitcoin Icon */}
        <div className="flex items-center gap-2 mb-8">
          <div className="relative h-16 w-16 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">₿</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              Bitcoin is forecasted to be priced at 107269.21 USDT or more at
              06:20 PM?
            </h1>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-8 mb-6">
          <button
            onClick={() => scrollToSection("orderbook")}
            className="pb-1 px-1 border-b-2 border-primary text-primary font-medium"
          >
            Orderbook
          </button>
          <button
            onClick={() => scrollToSection("timeline")}
            className="pb-1 px-1 border-b-2 border-transparent text-gray-600 hover:text-[#262626]"
          >
            Timeline
          </button>
          <button
            onClick={() => scrollToSection("overview")}
            className="pb-1 px-1 border-b-2 border-transparent text-gray-600 hover:text-[#262626]"
          >
            Overview
          </button>
        </div>

        {/* Orderbook Section */}
        {session?.data && (
          <section id="orderbook" className="space-y-6 mb-8">
            <OrderBookTabs />
          </section>
        )}

        {/* Timeline Section */}
        <section id="timeline" className="space-y-6 mb-8">
          <Card className="shadow-none py-0">
            <CardContent className="p-6">
              {/* YES/NO Display - Clickable to toggle */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={toggleOption}
                >
                  <div
                    className={`p-2 rounded-lg ${selectedOption === "yes" ? "bg-blue-50" : "bg-red-50"}`}
                  >
                    <ArrowLeftRight
                      className={`h-4 w-4 strokeWidth={0.5} ${selectedOption === "yes" ? "text-blue-600" : "text-red-600"}`}
                    />
                  </div>
                  <div>
                    <p>Timeline</p>
                    <div className="font-medium text-sm text-gray-600">
                      {selectedOption.toUpperCase()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <ChartSettings
                  showGrids={showGrids}
                  setShowGrids={setShowGrids}
                  showTradeVolume={showTradeVolume}
                  setShowTradeVolume={setShowTradeVolume}
                />
              )}

              {/* Time Filter */}
              <div className="flex justify-between">
                <div className="flex mb-6">
                  <Button
                    variant="ghost"
                    className="py-1 h-auto text-xm rounded-none text-[#262626] font-semibold hover:none"
                  >
                    5 m
                  </Button>
                  <Button
                    variant="ghost"
                    className="py-1 h-auto text-xm rounded-none border-b-2 border-primary font-semibold hover:none"
                  >
                    All
                  </Button>
                </div>
                <div className="h-4 w-[72px]">
                  <Image
                    src="/logo_watermark.avif"
                    alt="logo"
                    width={72}
                    height={20}
                  />
                </div>
              </div>

              <ProbabilityChart
                selectedOption={selectedOption}
                showGrids={showGrids}
                showTradeVolume={showTradeVolume}
                onOptionChange={toggleOption}
                onBarClick={handleBarClick}
              />
            </CardContent>
          </Card>
        </section>

        {/* Timeline Section */}
        <section id="stats" className="space-y-6 mb-8">
          <Card className="shadow-none gap-1">
            <CardHeader className="text-[#262626] font-medium">
              <h2 className="text-xl font-semibold">Stats</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">06:09 PM - Market Update</div>
                    <div className="text-sm text-gray-600">
                      Bitcoin price movement detected
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">05:45 PM - Large Order</div>
                    <div className="text-sm text-gray-600">
                      Significant buy order executed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Overview Section */}
        <section id="overview" className="text-xs">
          <AboutEvent />
        </section>
      </div>

      {/* Download App Section - Right Sidebar */}
      <div className="w-96 flex-shrink-0">
        <div className="sticky top-6">
          <DownloadApp />
        </div>
      </div>
    </div>
  );
}
