"use client";

import { BarChart3, Grid } from "lucide-react";

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
        className="flex items-center justify-between gap-3 p-3 border rounded-lg flex-1 cursor-pointer hover:bg-gray-50"
        onClick={() => setShowTradeVolume(!showTradeVolume)}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Trade Volume</span>
        </div>
        <span className="text-xs text-gray-500">
          {showTradeVolume ? "Hide" : "Show"}
        </span>
      </div>

      <div
        className="flex items-center justify-between gap-3 p-3 border rounded-lg flex-1 cursor-pointer hover:bg-gray-50"
        onClick={() => setShowGrids(!showGrids)}
      >
        <div className="flex items-center gap-2">
          <Grid className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Grids</span>
        </div>
        <span className="text-xs text-gray-500">
          {showGrids ? "Hide" : "Show"}
        </span>
      </div>
    </div>
  );
}
