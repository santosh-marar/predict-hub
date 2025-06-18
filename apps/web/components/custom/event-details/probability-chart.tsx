"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ChartContainer } from "@repo/ui/components/chart";

interface ProbabilityChartProps {
  selectedOption: "yes" | "no";
  showGrids: boolean;
  showTradeVolume: boolean;
  onOptionChange: () => void;
  onBarClick: (data: { time: string; yes: number; no: number }) => void;
}

// YES data - higher probability
const yesLineData = [
  { time: "18:25", value: 62 },
  { time: "18:26", value: 58 },
  { time: "18:26", value: 64 },
  { time: "18:27", value: 61 },
  { time: "18:27", value: 59 },
  { time: "18:28", value: 66 },
  { time: "18:28", value: 68 },
  { time: "18:29", value: 65 },
  { time: "18:30", value: 67 },
  { time: "18:31", value: 65 },
];

// NO data - lower probability
const noLineData = [
  { time: "18:25", value: 38 },
  { time: "18:26", value: 42 },
  { time: "18:26", value: 36 },
  { time: "18:27", value: 39 },
  { time: "18:27", value: 41 },
  { time: "18:28", value: 34 },
  { time: "18:28", value: 32 },
  { time: "18:29", value: 35 },
  { time: "18:30", value: 33 },
  { time: "18:31", value: 35 },
];

const barData = [
  { time: "18:25", yes: 45, no: 25 },
  { time: "18:26", yes: 35, no: 15 },
  { time: "18:27", yes: 55, no: 30 },
  { time: "18:27", yes: 25, no: 20 },
  { time: "18:28", yes: 40, no: 25 },
  { time: "18:28", yes: 65, no: 35 },
  { time: "18:29", yes: 30, no: 20 },
  { time: "18:30", yes: 50, no: 25 },
  { time: "18:30", yes: 35, no: 30 },
  { time: "18:31", yes: 45, no: 25 },
];

// Custom tooltip components
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`Time: ${label}`}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {`${payload[0].name}: ${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`Time: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProbabilityChart({
  selectedOption,
  showGrids,
  showTradeVolume,
  onOptionChange,
  onBarClick,
}: ProbabilityChartProps) {
  const color = selectedOption === "yes" ? "#3b82f6" : "#ef4444";
  const lineData = selectedOption === "yes" ? yesLineData : noLineData;

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      onBarClick(clickedData);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Line Chart Container */}
      <div className="h-full w-full cursor-pointer">
        <ChartContainer
          config={{
            value: {
              label: selectedOption.toUpperCase(),
              color: color,
            },
          }}
          className="h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                orientation="right"
              />

              <Tooltip content={<CustomAreaTooltip />} />
              {showGrids && (
                <CartesianGrid
                  stroke="#eee"
                  strokeWidth={1.5}
                  vertical={false}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: color,
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Bar Chart Container */}
      {showTradeVolume && (
        <ChartContainer
          config={{
            yes: { label: "Yes", color: "#3b82f6" },
            no: { label: "No", color: "#f87171" },
          }}
          className="h-32 w-full"
        >
          <ResponsiveContainer>
            <BarChart
              data={barData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              height={1}
              width={0.5}
              onClick={handleBarClick}
              barCategoryGap={4}
            >
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis hide domain={[0, "dataMax + 10"]} />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={false}
                trigger="click"
              />
              <Bar
                dataKey="yes"
                fill="#60a5fa"
                radius={[2, 2, 0, 0]}
                style={{ cursor: "default" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  );
}
