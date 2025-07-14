// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import OrderBookActivityTab from "./activity-tab";
import { useOrderBook } from "@/hooks/use-order-book";

interface OrderBookProps {
  eventId: string;
  userId: string;
}

interface OrderBookEntry {
  price: string;
  quantity: string;
  orders: number;
  side: string;
  type: string;
  isAsk?: boolean;
}

export default function OrderBookTabs({ eventId, userId }: OrderBookProps) {
  const [subTab, setSubTab] = useState("orderbook");

  const {
    orderBookData: realOrderBookData,
    isSubscribed,
    isConnected,
    error,
    unsubscribeFromOrderBook,
  } = useOrderBook(eventId, userId);

  console.log("realOrderBookData", realOrderBookData);

  // Process the real order book data to always to show 5 rows only
  const processOrderBookData = () => {
    if (!realOrderBookData) {
      return {
        yesOrders: Array(5).fill({ price: 0, quantity: 0, isAsk: false }),
        noOrders: Array(5).fill({ price: 0, quantity: 0, isAsk: false }),
      };
    }

    // Combine and process YES orders (bids and asks)
    const yesOrdersData = [
      ...realOrderBookData.yesBids.map((order: OrderBookEntry) => ({
        price: Number.parseFloat(order.price),
        quantity: Number.parseFloat(order.quantity),
        isAsk: false,
      })),
      ...realOrderBookData.yesAsks.map((order: OrderBookEntry) => ({
        price: Number.parseFloat(order.price),
        quantity: Number.parseFloat(order.quantity),
        isAsk: true,
      })),
    ].sort((a, b) => b.price - a.price);

    // Combine and process NO orders (bids and asks)
    const noOrdersData = [
      ...realOrderBookData.noBids.map((order: OrderBookEntry) => ({
        price: Number.parseFloat(order.price),
        quantity: Number.parseFloat(order.quantity),
        isAsk: false,
      })),
      ...realOrderBookData.noAsks.map((order: OrderBookEntry) => ({
        price: Number.parseFloat(order.price),
        quantity: Number.parseFloat(order.quantity),
        isAsk: true,
      })),
    ].sort((a, b) => b.price - a.price);

    // Always return 5 rows, fill "0" if there is no data
    const yesOrders = Array(5)
      .fill(null)
      .map(
        (_, index) =>
          yesOrdersData[index] || { price: "0", quantity: "0", isAsk: false }
      );

    const noOrders = Array(5)
      .fill(null)
      .map(
        (_, index) =>
          noOrdersData[index] || { price: "0", quantity: "0", isAsk: false }
      );

    return { yesOrders, noOrders };
  };

  const { yesOrders, noOrders } = processOrderBookData();

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
                : "text-gray-500 border-transparent hover:text-gray-700"
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
                  <span className="text-sm">
                    QTY AT{" "}
                    <span className="font-semibold text-blue-600">YES</span>
                  </span>
                </div>
                <div className="">
                  {yesOrders.map((item, index) => (
                    <div
                      key={`yes-${index}`}
                      className={`flex justify-between items-center py-2 rounded border-b last:border-b-0 ${
                        item.quantity > 0
                          ? item.isAsk
                            ? "bg-red-50"
                            : "bg-blue-50"
                          : ""
                      }`}
                    >
                      <span className="text-sm text-[#262626]">
                        {item.price > 0 ? Number(item.price).toFixed(2) : "0"}
                      </span>
                      <span className="text-sm text-[#262626]">
                        {item.quantity > 0
                          ? Number(item.quantity).toLocaleString()
                          : "0"}
                      </span>
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
                    QTY AT{" "}
                    <span className="font-semibold text-red-600">NO</span>
                  </span>
                </div>
                <div className="">
                  {noOrders.map((item, index) => (
                    <div
                      key={`no-${index}`}
                      className={`flex justify-between items-center py-2 rounded border-b last:border-b-0 ${
                        item.quantity > 0
                          ? item.isAsk
                            ? "bg-red-50"
                            : "bg-blue-50"
                          : ""
                      }`}
                    >
                      <span className="text-sm text-[#262626]">
                        {item.price > 0 ? Number(item.price).toFixed(2) : "0"}
                      </span>
                      <span className="text-sm text-[#262626]">
                        {item.quantity > 0
                          ? Number(item.quantity).toLocaleString()
                          : "0"}
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
