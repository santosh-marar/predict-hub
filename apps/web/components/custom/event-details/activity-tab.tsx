import { Avatar, AvatarFallback } from "@repo/ui/components/avatar"
import { Card, CardContent } from "@repo/ui/components/card"
import { ChevronUp, ChevronDown } from "lucide-react"

export default function OrderBookActivityTab() {
  const activities = [
    {
      id: 1,
      leftUser: "prober",
      rightUser: "Prober",
      leftPrice: "₹9.5",
      rightPrice: "₹0.5",
      timestamp: "a few seconds ago",
    },
    {
      id: 2,
      leftUser: "prober",
      rightUser: "Prober",
      leftPrice: "₹9.5",
      rightPrice: "₹0.5",
      timestamp: "a few seconds ago",
    },
    {
      id: 3,
      leftUser: "prober",
      rightUser: "Prober",
      leftPrice: "₹9.5",
      rightPrice: "₹0.5",
      timestamp: "a few seconds ago",
    },
  ]

  return (
    <Card className="border-none shadow-none p-0">
      <CardContent className="p-0">
        {/* Activity Feed */}
        <div className="relative">
          <div className="space-y-0 max-h-72 overflow-y-auto">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
              >
                {/* Left Side */}
                <div className="flex flex-col items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium [#262626]">
                    {activity.leftUser}
                  </span>
                </div>

                {/* Center Content */}
                <div className="flex flex-col items-center justify-center space-x-3">
                  <div className="grid grid-cols-20">
                    <div className="col-span-19 bg-blue-100 text-blue-700 pl-2 py-2 text-sm font-medium text rounded-l-lg">
                      {activity.leftPrice}
                    </div>
                    <div className="col-span-1 bg-red-100 text-red-700 pr-2  pr-6 py-2 text-sm font-medium text-left rounded-r-lg">
                      {activity.rightPrice}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.timestamp}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium [#262626]">
                    {activity.rightUser}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
