"use client"

import { getMinutesLeft } from "@/lib/utils";
import { ExpiresIn } from "@/components/custom/expire-in";
import Image from "next/image";
import {Card, CardContent} from "@repo/ui/components/card";
import Link from "next/link";
import { useRouter } from "next/navigation";


export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  categoryTitle: string;
  subCategoryId: string;
  subCategoryTitle: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  resolutionTime: string; // ISO date string
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolvedOutcome: boolean | null;
  resolutionNotes: string | null;
  status: "draft" | "active" | "ended" | "resolved" | "cancelled";
  totalVolume: string; // stored as string for precision (e.g. "0.00")
  totalYesShares: string;
  totalNoShares: string;
  lastYesPrice: string;
  lastNoPrice: string;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
};


interface EventCardProps {
  events: Event[];
  filterExpiresInMinutes?: 10 | 20; // Optional filter
}

const EventCard = ({ events, filterExpiresInMinutes }: EventCardProps) => {

  const filteredEvents = filterExpiresInMinutes
    ? events.filter((event) => {
        const minutesLeft = getMinutesLeft(event.endTime);
        return Math.abs(minutesLeft - filterExpiresInMinutes) <= 1;
      })
    : events;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {filteredEvents?.length > 0 ? (
        filteredEvents.map((event) => (
          <Link
            key={event.id}
            // href={`/events/${encodeURIComponent(event.title.toLowerCase().replace(/\s+/g, "-"))}`}
            href={`/events/details/${event.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow py-0 cursor-pointer">
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
                      <ExpiresIn
                        endTime={event.endTime}
                        totalVolume={event.totalVolume}
                      />
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      📈
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#262626] font-medium mb-1 first-letter:capitalize">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-xs text-[#545454] font-medium flex items-center">
                    <Image
                      src="/probo_logo.avif"
                      alt="probo"
                      width={20}
                      height={20}
                    />
                    <p>{event.description || "No description available"}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <button className="flex-1 bg-[#e8f2ff] text-[#197bff] rounded-md py-2">
                    Yes @ {event.lastYesPrice || "N/A"}
                  </button>
                  <button className="flex-1 bg-[#fdf3f2] text-[#dc2804] rounded-md py-2 transition">
                    No @ {event.lastNoPrice || "N/A"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-500 mb-2">No events found</div>
        </div>
      )}
    </div>
  );
};

export default EventCard;