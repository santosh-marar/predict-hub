import { Card, CardContent } from "@repo/ui/components/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export default function MarketMetrics() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Market Metrics</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 flex items-center justify-center">
                <span className="text-xs font-medium">61</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fear and Greed</div>
              <div className="font-medium">61</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Market Cap</div>
              <div className="font-medium">$2.13T</div>
              <div className="text-sm text-red-500 flex items-center">
                <ArrowDownIcon className="h-3 w-3 mr-1" />
                2.34% (1D)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowUpIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Volume</div>
              <div className="font-medium">11.11K</div>
              <div className="text-sm text-green-500 flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                26.78% (1D)
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <div className="text-sm text-gray-600">Last updated:</div>
            <div className="font-medium">12th June 06:09 PM</div>
            <div className="text-xs text-gray-500">Powered By Datamuni</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
