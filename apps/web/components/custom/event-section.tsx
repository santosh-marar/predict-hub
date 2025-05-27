"use client";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  "All events",
  "Cricket",
  "Crypto",
  "News",
  "Football",
  "Youtube",
  "Motorsports",
  "Gaming",
  "Basketball",
  "Chess",
  "Tennis",
  "Probo",
];

const events = [
  {
    id: 1,
    category: "Cricket",
    traders: 74358,
    title: "Punjab to win the match vs Mumbai?",
    description: "H2H last 5: T20 - Punjab 2, Mumbai 3, DRAW 0",
    icon: "🏏",
    iconBg: "bg-red-500",
    yesPrice: "₹4.7",
    noPrice: "₹5.3",
  },
  {
    id: 2,
    category: "Crypto",
    traders: 228,
    title:
      "Bitcoin is forecasted to reach at 109665.91 USDT or more at 09:00 PM?",
    description: "Bitcoin open price at 08:40 PM was 109665.91 USDT.",
    icon: "₿",
    iconBg: "bg-orange-500",
    yesPrice: "₹5.5",
    noPrice: "₹4.5",
  },
  {
    id: 3,
    category: "Cricket",
    traders: 7854,
    title: "Mumbai to score 192 runs or more in the match vs Punjab?",
    description: "Mumbai requires 68 runs in 35 balls",
    icon: "🏏",
    iconBg: "bg-blue-500",
    yesPrice: "₹5.5",
    noPrice: "₹4.5",
  },
  {
    id: 4,
    category: "Cricket",
    traders: 4201,
    title: "England Women to win the 3rd T20I vs West Indies Women?",
    description: "H2H last 5 T20 - ENG-W 4, WI-W 1, DRAW 0",
    icon: "🏏",
    iconBg: "bg-red-600",
    yesPrice: "₹8",
    noPrice: "₹2",
  },
  {
    id: 5,
    category: "News",
    traders: 5819,
    title: "India's GDP growth rate to be 6.2% or more for Q4 FY24-25?",
    description: "India's GDP grew 6.2% in Q3 in FY24-25.",
    icon: "🏛️",
    iconBg: "bg-green-500",
    yesPrice: "₹8",
    noPrice: "₹1",
  },
  {
    id: 6,
    category: "Cricket",
    traders: 2616,
    title:
      "Will Virat Kohli surpass Sachin Tendulkar's International Cricket centuries by the end of 2027?",
    description:
      "Virat Kohli: 82 international centuries | Sachin Tendulkar: 100 international centuries (record holder, retired)",
    icon: "👤",
    iconBg: "bg-yellow-500",
    yesPrice: "₹2",
    noPrice: "₹8",
  },
];

const quickEvents = [
  { name: "PUNMUM", icon: "🏏", bg: "bg-red-500", category: "Cricket" },
  { name: "ENG-WWII-W", icon: "🏏", bg: "bg-red-500", category: "Cricket" },
  { name: "Bitcoin", icon: "₿", bg: "bg-orange-500", category: "Crypto" },
  { name: "Youtube", icon: "📺", bg: "bg-red-600", category: "Youtube" },
  {
    name: "French Open: Round 1",
    icon: "🎾",
    bg: "bg-orange-600",
    category: "Tennis",
  },
  { name: "SWE-WWITA-W", icon: "🏏", bg: "bg-blue-500", category: "Cricket" },
  { name: "OKCvMIN", icon: "🏀", bg: "bg-purple-600", category: "Basketball" },
  {
    name: "FFM SA Rivals",
    icon: "⚽",
    bg: "bg-green-600",
    category: "Football",
  },
  { name: "BMPS", icon: "🎮", bg: "bg-purple-500", category: "Gaming" },
];

export default function EventsSection() {
  const [activeCategory, setActiveCategory] = useState("All events");
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const filteredEvents =
    activeCategory === "All events"
      ? events
      : events.filter((event) => event.category === activeCategory);

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % quickEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex(
      (prev) => (prev - 1 + quickEvents.length) % quickEvents.length
    );
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-0 mb-6 border-b border-gray-200">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 relative border-b-2 ${
                  activeCategory === category
                    ? "bg-[#262626] text-white border-[#262626]"
                    : "text-gray-600 hover:text-black border-transparent"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Quick Events Carousel */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevEvent}
              className="hover:bg-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-3 overflow-hidden">
              {quickEvents
                .slice(currentEventIndex, currentEventIndex + 7)
                .map((event, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 min-w-fit hover:bg-gray-50 transition-colors duration-150 border border-gray-200"
                    onClick={() => setActiveCategory(event.category)}
                  >
                    <div
                      className={`w-6 h-6 ${event.bg} rounded flex items-center justify-center text-white text-xs`}
                    >
                      {event.icon}
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {event.name}
                    </span>
                  </button>
                ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextEvent}
              className="hover:bg-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Events Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {activeCategory}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 ${event.iconBg} rounded-lg flex items-center justify-center text-white text-xl`}
                      >
                        {event.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600 font-medium">
                            {event.traders.toLocaleString()} traders
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {event.description}
                        </p>
                        <a
                          href="#"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Read more
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                        Yes {event.yesPrice}
                      </Button>
                      <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                        No {event.noPrice}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download App Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    DOWNLOAD APP FOR BETTER & FAST EXPERIENCE
                  </h3>
                </div>
                <Button className="w-full bg-white text-black hover:bg-gray-100">
                  Download Now
                </Button>
              </CardContent>
            </Card>

            {/* Featured Stories */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Featured Stories</h3>
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-sm">
                      🏏
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Cricket</h4>
                      <p className="text-sm text-gray-600">May 26th 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
