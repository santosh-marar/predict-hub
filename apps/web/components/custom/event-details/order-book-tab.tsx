"use client";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import OrderBookActivityTab from "./activity-tab";

export default function OrderBookTabs() {
  const [subTab, setSubTab] = useState("activity");

  const orderBookData = [
    { price: 0.5, qtyNo: 53464 },
    { price: 1, qtyNo: 220574, highlighted: true },
    { price: 1.5, qtyNo: 20284 },
    { price: 2, qtyNo: 40197 },
    { price: 2.5, qtyNo: 20309 },
  ];

  return (
    <Card className="shadow-none border border-gray-200 p-0">
      <CardContent className="p-2">
        {/* Sub Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-2 text-sm border-b-2 ${
              subTab === "orderbook"
                ? "text-[#262626] font-semibold border-gray-900"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
            onClick={() => setSubTab("orderbook")}
          >
            Order Book
          </button>
          <button
            className={`px-6 py-2 text-sm border-b-2 ${
              subTab === "activity"
                ? "text-[#262626] font-semibold border-gray-900"
                : "text-gray-500 border-transparent  hover:text-gray-700"
            }`}
            onClick={() => setSubTab("activity")}
          >
            Activity
          </button>
        </div>

        {/* Activity Tab Content */}
        {subTab === "activity" && <OrderBookActivityTab />}

        {/* Order Book Tab Content */}
        {subTab === "orderbook" && (
          <div className="px-6 py-2">
            <div className="grid grid-cols-2 gap-4 mb:gap-8">
              {/* Left Side - YES Orders */}
              <div>
                <div className="flex justify-between items-center border-b py-1">
                  <span className="text-sm font-medium text-[#262626]">
                    PRICE
                  </span>
                  <span className="text-sm ">
                    QTY AT {""}
                    <span className="font-semibold text-blue-600">YES</span>
                  </span>
                </div>
                <div className="">
                  {orderBookData.map((item, index) => (
                    <div
                      key={`yes-${index}`}
                      className={`flex justify-between items-center py-2 rounded border-b
                  ${item.highlighted ? "bg-blue-50" : ""} last:border-b-0`}
                    >
                      <span className="text-sm text-[#262626]">
                        {item.price}
                      </span>
                      <span className="text-sm text-[#262626]">
                        {item.qtyNo.toLocaleString()}
                      </span>{" "}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - NO Orders */}
              <div>
                <div className="flex justify-between items-center border-b py-1">
                  <span className="text-sm font-medium text-[#262626]">
                    PRICE
                  </span>
                  <span className="text-sm">
                    QTY AT {""}
                    <span className="font-semibold text-red-600">YES</span>
                  </span>
                </div>
                <div className="">
                  {orderBookData.map((item, index) => (
                    <div
                      key={`no-${index}`}
                      className={`flex justify-between items-center py-2 rounded border-b ${
                        item.highlighted ? "bg-red-50" : ""
                      } last:border-b-0`}
                    >
                      <span className="text-sm text-[#262626]">
                        {item.price}
                      </span>
                      <span className="text-sm text-[#262626]">
                        {item.qtyNo.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
