"use client";

import { BarChart3, Grid } from "lucide-react";
import Image from "next/image";

interface ChartSettingsProps {
  showGrids: boolean;
  setShowGrids: (show: boolean) => void;
  showTradeVolume: boolean;
  setShowTradeVolume: (show: boolean) => void;
}

export default function ChartSettings({
  showGrids,
  setShowGrids,
  showTradeVolume,
  setShowTradeVolume,
}: ChartSettingsProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div
        className="flex items-center justify-between gap-3 p-3 border rounded-2xl shadow-sm  flex-1 cursor-pointer hover:bg-gray-50 bg-[#f5f5f5]"
        onClick={() => setShowTradeVolume(!showTradeVolume)}
      >
        <div className="flex items-center gap-4">
          <Image src="/bar_chart.svg" alt="bar chart" width={16} height={16} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Trade Volume</span>
            <span className="text-xs text-gray-500">
              {showTradeVolume ? "Hide" : "Show"}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 p-3 border rounded-2xl shadow-sm flex-1 cursor-pointer bg-[#f5f5f5] hover:bg-gray-50"
        onClick={() => setShowGrids(!showGrids)}
      >
        <div className="flex items-center gap-4">
          <Image src="/grid.svg" alt="grid" width={16} height={16} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Grids</span>
            <span className="text-xs text-gray-500">
              {showGrids ? "Hide" : "Show"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
