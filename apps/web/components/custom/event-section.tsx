// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowBigDownDash,
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const featuredStories = [
  {
    title: "Messi's Magic Again?",
    description: "Lionel Messi dazzles with another stunning free kick goal!",
  },
  {
    title: "Crypto Market Booms",
    description:
      "Bitcoin and Ethereum hit new monthly highs amid investor optimism.",
  },
  {
    title: "Probo Event Insights",
    description: "Learn how Probo markets work with latest event examples.",
  },
];

export default function EventsSection() {
  const [activeCategory, setActiveCategory] = useState("All events");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [currentSubcategoryIndex, setCurrentSubcategoryIndex] = useState(0);

  // Fetch categories
  const getCategories = async () => {
    const response = await api.get("/category");
    return response.data;
  };

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["category"],
    queryFn: getCategories,
  });

  const getSubcategories = async () => {
    if (activeCategoryId) {
      const response = await api.get(
        `/sub-category?categoryId=${activeCategoryId}`,
      );
      return response.data;
    } else {
      const response = await api.get("/sub-category");
      return response.data;
    }
  };

  const {
    data: subcategoriesData,
    isLoading: isLoadingSubcategories,
    error: errorSubcategories,
  } = useQuery({
    queryKey: ["subcategories", activeCategoryId],
    queryFn: getSubcategories,
    enabled: true,
  });

  const getEvents = async () => {
    if (activeCategoryId) {
      const response = await api.get(`/event?categoryId=${activeCategoryId}`);
      return response.data;
    } else {
      const response = await api.get("/event");
      return response.data;
    }
  };

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: errorEvents,
  } = useQuery({
    queryKey: ["events", activeCategoryId],
    queryFn: getEvents,
  });

  const events = eventsData?.data || [];
  const categories = categoriesData?.data || [];
  const subcategories = subcategoriesData?.data || [];

  useEffect(() => {
    setCurrentSubcategoryIndex(0);
  }, [activeCategoryId]);

  const nextSubcategory = () => {
    if (subcategories.length > 0) {
      setCurrentSubcategoryIndex((prev) => (prev + 1) % subcategories.length);
    }
  };

  const prevSubcategory = () => {
    if (subcategories.length > 0) {
      setCurrentSubcategoryIndex(
        (prev) => (prev - 1 + subcategories.length) % subcategories.length,
      );
    }
  };

  const handleCategoryClick = (categoryName, categoryId = null) => {
    setActiveCategory(categoryName);
    setActiveCategoryId(categoryId);
    setCurrentSubcategoryIndex(0);
  };

  // Function to get subcategory icon and background color
  const getSubcategoryStyle = (subcategory) => {
    // You can customize this based on your subcategory data structure
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    const icons = ["🏆", "⚽", "🏀", "🎾", "🏐", "🏓", "🎯", "🎮"];

    const index = subcategory.id % colors.length;
    return {
      bg: colors[index],
      icon: subcategory.icon || icons[index],
    };
  };

  const handleSubcategoryClick = (subCategoryTitle) => {
    <Link href={`/events/${subCategoryTitle}`}></Link>;
  };

  const handleEventClick = (eventTitle) => {
    <Link href={`/events/details/${eventTitle}`}></Link>;
  };

  if (isLoadingCategories || isLoadingEvents) {
    return (
      <section className="bg-gray-100 pb-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  if (errorCategories || errorEvents) {
    return (
      <section className="bg-gray-100 pb-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error loading data</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 pb-12">
      <div>
        {/* Category Filter */}
        <div className="mb-8 border-gray-200">
          <div className="flex flex-wrap gap-0 border-b">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* All events button */}
              <button
                className={`px-4 pt-6 pb-1 text-sm font-medium transition-colors duration-200 relative border-b-2 ${
                  activeCategory === "All events"
                    ? "text-[#262626] border-b border-[#262626]"
                    : "text-gray-600 hover:text-black border-transparent"
                }`}
                onClick={() => handleCategoryClick("All events", null)}
              >
                All events
              </button>

              {/* Category buttons */}
              {categories?.map((category) => (
                <button
                  key={category?.id}
                  className={`px-4 pt-6 pb-1 text-sm transition-colors duration-200 relative border-b-2 capitalize ${
                    activeCategory === category.title
                      ? "text-[#262626] font-medium border-b border-[#262626]"
                      : "text-gray-600 hover:text-black border-transparent"
                  }`}
                  onClick={() =>
                    handleCategoryClick(category.title, category.id)
                  }
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories Carousel */}
          <div className="flex items-center gap-4 mt-6 overflow-x-auto no-scrollbar border-none mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {subcategories.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSubcategory}
                  disabled={subcategories.length <= 7}
                  className="hover:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-3 min-w-[0] overflow-hidden flex-1">
                  {subcategories
                    .slice(currentSubcategoryIndex, currentSubcategoryIndex + 7)
                    .map((subcategory) => {
                      const style = getSubcategoryStyle(subcategory);
                      return (
                        <Button
                          key={subcategory.id}
                          className=" shadow-2xl bg-white text-[#262626] hover:bg-gray-100 transition-colors duration-150"
                          asChild
                        >
                          <span className="text-sm whitespace-nowrap capitalize font-medium text-black">
                            <Link
                              href={`/events/${subcategory.title}`}
                              className=""
                            >
                              {subcategory.title}
                            </Link>
                          </span>
                        </Button>
                      );
                    })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSubcategory}
                  disabled={subcategories.length <= 7}
                  className="hover:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {subcategories.length === 0 && !isLoadingSubcategories && (
              <div className="text-gray-500 text-sm py-2">
                {activeCategory === "All events"
                  ? "No subcategories available"
                  : `No subcategories found for "${activeCategory}"`}
              </div>
            )}

            {isLoadingSubcategories && (
              <div className="text-gray-500 text-sm py-2">
                Loading subcategories...
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Events Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold text-[#262626] mb-6 border-b pb-2">
              {activeCategory}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events?.length > 0 ? (
                events.map((event) => (
                  <Link
                    href={`/events/details/${encodeURIComponent(event.title)}?id=${event.id}`}
                    key={event.id}
                  >
                    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow py-0">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-start gap-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Image
                              src="/Bar_Chart.avif"
                              alt="chart"
                              width={20}
                              height={20}
                            />
                            <span className="text-sm text-gray-600 font-medium">
                              {event.traders
                                ? event.traders.toLocaleString()
                                : "0"}{" "}
                              traders
                            </span>
                          </div>
                          <div className="flex gap-4">
                            <div
                              className={`w-16 h-16 ${
                                event.iconBg || "bg-blue-500"
                              } rounded-lg flex items-center justify-center text-white text-xl`}
                            >
                              {event.icon || "📈"}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[#262626] font-medium mb-1 first-letter:capitalize">
                                {event.title}
                              </h3>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-[#545454] font-medium flex items-center">
                              <Image
                                src="/probo_logo.avif"
                                alt="probo"
                                width={20}
                                height={20}
                              />
                              <p>
                                {event.description ||
                                  "No description available"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm font-medium">
                          <button className="flex-1 bg-[#e8f2ff] text-[#197bff] rounded-md py-2">
                            Yes @{" "}
                            {event.lastYesPrice != null
                              ? Number(event.lastYesPrice).toFixed(2)
                              : "N/A"}
                          </button>
                          <button className="flex-1 bg-[#fdf3f2] text-[#dc2804] rounded-md py-2 transition">
                            No @{" "}
                            {event.lastNoPrice != null
                              ? Number(event.lastNoPrice).toFixed(2)
                              : "N/A"}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 mb-2">No events found</div>
                  <p className="text-sm text-gray-400">
                    {activeCategory === "All events"
                      ? "No events available at the moment."
                      : `No events found in "${activeCategory}" category.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 hidden lg:block">
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
              <div className="space-y-4">
                {featuredStories.map((story, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {story.title}
                    </h4>
                    <p className="text-sm text-gray-600">{story.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
