"use client";

import { formatDateIntoDayMonthYear } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";

interface AboutEventProps {
  sourceOfTruth: string;
  description: string;
  endTime: string;
  startTime: string;
  rules: string;
  eventOverviewAndStatistics:string
}

export default function AboutEvent({
  sourceOfTruth,
  description,
  endTime,
  startTime,
  rules,
  eventOverviewAndStatistics,
}: AboutEventProps) {
  return (
    <Card className="shadow-none gap-1">
      <CardHeader className="text-[#262626] font-medium">
        <h2 className="text-xl font-semibold">About the event</h2>
      </CardHeader>
      <CardContent className="mb-0 py-0 space-y-6">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <h5 className="text-xs font-semibold text-[#262626]">
              Source of truth
            </h5>
            <p className="text-xs text-[#757575]">{sourceOfTruth}</p>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-[#262626]">
              Trading started on
            </h5>
            <p className="text-xs text-[#757575]">
              {" "}
              {formatDateIntoDayMonthYear(startTime)}
            </p>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-[#262626]">
              Event expires on
            </h5>
            <p className="text-xs text-[#757575]">
              {formatDateIntoDayMonthYear(endTime)}
            </p>
          </div>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-[#262626]">
            Event Overview & Statistics
          </h5>
          <p className="text-xs text-[#757575]">{eventOverviewAndStatistics}</p>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-[#262626]">Rules</h5>
          <p className="text-xs text-[#757575]">{rules}</p>
        </div>
      </CardContent>
    </Card>
  );
}
