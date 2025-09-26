"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { X } from "lucide-react";

// Trade type
type Trade = {
  id: number;
  event: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
};

const mockActiveTrades: Trade[] = [
  {
    id: 1,
    event: "Will India win the T20 WC?",
    qty: 10,
    avgPrice: 45,
    currentPrice: 52,
  },
  {
    id: 2,
    event: "Will Nifty close above 20,000?",
    qty: 5,
    avgPrice: 60,
    currentPrice: 55,
  },
];

const mockClosedTrades: Trade[] = [
  {
    id: 3,
    event: "Will Apple launch AR Glasses in 2024?",
    qty: 8,
    avgPrice: 30,
    currentPrice: 0,
  },
];

export default function PortfolioWrapper({
  subCategoryTitle = "portfolio",
  user = { name: "John Doe" },
  eventsData,
}: {
  subCategoryTitle?: string;
  user?: { name: string } | null;
  eventsData?: any;
}) {
  const [activeTab, setActiveTab] = useState<"trade" | "portfolio">("trade");

  // Sell dialog state
  const [sellTrade, setSellTrade] = useState<Trade | null>(null);
  const [qty, setQty] = useState<string>("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");

  const handleSell = (trade: Trade) => setSellTrade(trade);

  const closeDialog = () => {
    setSellTrade(null);
    setQty("0");
    setOrderType("market");
    setLimitPrice("");
  };

  const estProceeds =
    sellTrade && qty
      ? orderType === "market"
        ? sellTrade.currentPrice * Number(qty)
        : Number(qty) * Number(limitPrice || 0)
      : 0;

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="bg-[#f5f5f5] min-h-screen relative">
        {/* Waves background */}
        <div className="absolute bottom-0 left-0 w-full z-0">
          <Image
            src="/waves.svg"
            alt="wave background"
            width={1280}
            height={175}
            className="mx-auto"
          />
        </div>

        <div className="container mx-auto px-6 py-4 max-w-6xl">
          {/* Custom Tabs */}
          <div className="mb-4 text-center">
            <div className="flex space-x-12 border-b-2 border-gray-200 justify-center ">
              <button
                onClick={() => setActiveTab("trade")}
                className={`pb-2 w-36 relative ${
                  activeTab === "trade"
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-[#252525]"
                }`}
              >
                Active Trade
                {activeTab === "trade" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-black"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`pb-2 w-36 relative ${
                  activeTab === "portfolio"
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-[#252525]"
                }`}
              >
                Closed Trade
                {activeTab === "portfolio" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-black"></div>
                )}
              </button>
            </div>
          </div>

          {/* Trade tab */}
          {activeTab === "trade" && (
            <div className="py-6">
              <div className="space-y-4">
                {/* Active Trades */}
                <h3 className="text-lg font-semibold mb-2">Active Trades</h3>
                {mockActiveTrades.map((trade) => (
                  <Card key={trade.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{trade.event}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div>
                        <p>Qty: {trade.qty}</p>
                        <p>Avg Price: ₹{trade.avgPrice}</p>
                        <p>Current Price: ₹{trade.currentPrice}</p>
                      </div>
                      <Button onClick={() => handleSell(trade)}>Sell</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio tab */}
          {user && activeTab === "portfolio" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">My Portfolio</h2>

              {/* Closed Trades */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Closed Trades</h3>
                {mockClosedTrades.map((trade) => (
                  <Card key={trade.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{trade.event}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Qty: {trade.qty}</p>
                      <p>Sold at Avg Price: ₹{trade.avgPrice}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!user && activeTab === "portfolio" && (
            <div className="py-16">
              <div className="text-lg flex items-center justify-center gap-4 text-[#262626]">
                <Image src="/auth.avif" alt="auth" width={148} height={148} />
                <div className="py-2 flex flex-col gap-3 ">
                  <h2 className="text-3xl font-semibold">
                    Login to your account
                  </h2>
                  <p>You will be able to see your trades after logging in</p>
                  <Button className="text-bold text-white w-26">Login</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sell Dialog */}
      <Dialog open={!!sellTrade} onOpenChange={closeDialog}>
        <DialogContent className="hidden sm:block">
          <DialogHeader className="mb-4">
            <DialogTitle>Sell {sellTrade?.event}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Order type */}
            <div className="flex space-x-4">
              <Button
                variant={orderType === "market" ? "default" : "outline"}
                onClick={() => setOrderType("market")}
              >
                Market
              </Button>
              <Button
                variant={orderType === "limit" ? "default" : "outline"}
                onClick={() => setOrderType("limit")}
              >
                Limit
              </Button>
            </div>

            <Input
              placeholder="Enter qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              type="number"
            />

            {orderType === "limit" && (
              <Input
                placeholder="Enter limit price"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                type="number"
              />
            )}

            <p className="text-sm text-muted-foreground">
              Est. you will receive: ₹{estProceeds}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button disabled={!qty || (orderType === "limit" && !limitPrice)}>
              Confirm Sell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Sheet */}
      {sellTrade && (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-lg sm:hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Sell {sellTrade.event}</h2>
            <button onClick={closeDialog}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex space-x-4 mb-3">
            <Button
              variant={orderType === "market" ? "default" : "outline"}
              onClick={() => setOrderType("market")}
            >
              Market
            </Button>
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              onClick={() => setOrderType("limit")}
            >
              Limit
            </Button>
          </div>

          <Input
            placeholder="Enter qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            type="number"
          />

          {orderType === "limit" && (
            <Input
              placeholder="Enter limit price"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              type="number"
            />
          )}

          <p className="text-sm text-muted-foreground mt-2">
            Est. Proceeds: ₹{estProceeds}
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              disabled={!qty || (orderType === "limit" && !limitPrice)}
              onClick={() =>
                handleSell({
                  id: 123988,
                  qty: Number(qty),
                  // orderType,
                  // limitPrice: orderType === "limit" ? limitPrice : null,
                  event: orderType,
                  currentPrice: Number(limitPrice),
                  avgPrice: Number(qty),
                })
              }
            >
              Confirm Sell
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
