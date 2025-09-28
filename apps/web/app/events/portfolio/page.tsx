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
import { X, Minus, Plus } from "lucide-react";
import { useCurrentPosition } from "@/hooks/use-postion";
import { useSession } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";

// Position type based on your data structure
type Position = {
  id: string;
  eventId: string;
  title: string;
  side: "yes" | "no";
  shares: string;
  averagePrice: string;
  lastYesPrice: string;
  lastNoPrice: string;
  totalInvested: string;
  unrealizedPnl: string;
  realizedPnl: string;
};

// Mock closed trades for demonstration
const mockClosedTrades = [
  {
    id: "3",
    title: "Will Apple launch AR Glasses in 2024?",
    side: "yes" as const,
    shares: "8",
    averagePrice: "3.0",
    soldPrice: "0",
    realizedPnl: "-24.00",
  },
];

export default function PortfolioWrapper() {
  const [activeTab, setActiveTab] = useState<"trade" | "portfolio">("trade");

  // Sell dialog state
  const [sellPosition, setSellPosition] = useState<Position | null>(null);
  const [sellQty, setSellQty] = useState<string>("1");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState<string>("");

  const session = useSession();
  const { data, isLoading, error } = useCurrentPosition();
  const userCurrentPosition = data?.data as Position[] | undefined;

  const mutation = useMutation({
    mutationFn: async (sellData: {
      eventId: string;
      side: "yes" | "no";
      quantity: number;
      type: "sell";
      orderType: "market" | "limit";
      limitPrice?: number;
    }) => {
      const response = await api.post("/order", sellData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["currentPosition"] });
      toast.success("Sell order placed successfully!");
      closeDialog();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      console.error("Sell order error:", error.response?.data);
    },
  });

  const handleSellClick = (position: Position) => {
    setSellPosition(position);
    setSellQty("1");
    setOrderType("market");
    setLimitPrice("");
  };

  const handleConfirmSell = () => {
    if (!sellPosition) return;

    const quantity = parseInt(sellQty);
    const maxShares = parseInt(sellPosition.shares);

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (quantity > maxShares) {
      toast.error(`You only have ${maxShares} shares available`);
      return;
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error("Please enter a valid limit price");
      return;
    }

    const sellData = {
      eventId: sellPosition.eventId,
      side: sellPosition.side,
      quantity: quantity,
      type: "sell" as const,
      orderType: orderType,
      ...(orderType === "limit" && { limitPrice: parseFloat(limitPrice) }),
      // ...(orderType === "market" && { side: "yes" } && price: parseFloat(lastYesPrice)),
      // ...(orderType === "market" && { side: "yes" } && price: parseFloat(lastYesPrice)),
    };

    mutation.mutate(sellData);
  };

  const closeDialog = () => {
    setSellPosition(null);
    setSellQty("1");
    setOrderType("market");
    setLimitPrice("");
  };

  const getCurrentPrice = (position: Position) => {
    return position.side === "yes"
      ? parseFloat(position.lastYesPrice)
      : parseFloat(position.lastNoPrice);
  };

  const getEstimatedProceeds = () => {
    if (!sellPosition) return 0;
    
    const qty = parseInt(sellQty) || 0;
    let price = 0;
    
    if (orderType === "market") {
      price = getCurrentPrice(sellPosition);
    } else {
      price = parseFloat(limitPrice) || 0;
    }
    
    return qty * price;
  };

  const getPnL = (position: Position) => {
    const currentPrice = getCurrentPrice(position);
    const avgPrice = parseFloat(position.averagePrice);
    const shares = parseFloat(position.shares);
    const unrealizedPnL = (currentPrice - avgPrice) * shares;
    
    return {
      unrealizedPnL: unrealizedPnL,
      unrealizedPnLPercentage: ((currentPrice - avgPrice) / avgPrice) * 100,
    };
  };

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
            <div className="flex space-x-12 border-b-2 border-gray-200 justify-center">
              <button
                onClick={() => setActiveTab("trade")}
                className={`pb-2 w-36 relative ${
                  activeTab === "trade"
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-[#252525]"
                }`}
              >
                Active Positions
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
                Closed Positions
                {activeTab === "portfolio" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-black"></div>
                )}
              </button>
            </div>
          </div>

          {/* Active Positions Tab */}
          {activeTab === "trade" && (
            <div className="py-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Active Positions</h3>
                
                {isLoading && (
                  <div className="text-center py-8">Loading positions...</div>
                )}
                
                {!isLoading && (!userCurrentPosition || userCurrentPosition.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No active positions found
                  </div>
                )}

                {userCurrentPosition?.map((position: Position) => {
                  const currentPrice = getCurrentPrice(position);
                  const pnl = getPnL(position);
                  
                  return (
                    <Card key={position.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg capitalize flex justify-between items-start">
                          <span>{position.title}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            position.side === "yes" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {position.side.toUpperCase()}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Shares</p>
                            <p className="font-semibold">{Number(position.shares).toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Avg. Price</p>
                            <p className="font-semibold">₹{Number(position.averagePrice).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Price</p>
                            <p className="font-semibold">₹{currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Invested</p>
                            <p className="font-semibold">₹{Number(position.totalInvested).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Unrealized P&L</p>
                            <p className={`font-semibold ${
                              pnl.unrealizedPnL >= 0 ? "text-green-600" : "text-destructive"
                            }`}>
                              ₹{pnl.unrealizedPnL.toFixed(2)} ({pnl.unrealizedPnLPercentage > 0 ? "+" : ""}{pnl.unrealizedPnLPercentage.toFixed(2)}%)
                            </p>
                          </div>
                          <Button 
                            onClick={() => handleSellClick(position)}
                            variant="destructive"
                          >
                            Sell
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Closed Positions Tab */}
          {session && activeTab === "portfolio" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Closed Positions</h2>
              <div>
                <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                {mockClosedTrades.map((trade) => (
                  <Card key={trade.id}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{trade.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Side</p>
                          <p className="font-semibold capitalize">{trade.side}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Shares</p>
                          <p className="font-semibold">{trade.shares}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg. Buy Price</p>
                          <p className="font-semibold">₹{Number(trade.averagePrice).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Realized P&L</p>
                          <p className={`font-semibold ${
                            parseFloat(trade.realizedPnl) >= 0 ? "text-green-600" : "text-destructive"
                          }`}>
                            ₹{trade.realizedPnl}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!session && activeTab === "portfolio" && (
            <div className="py-16">
              <div className="text-lg flex items-center justify-center gap-4 text-[#262626]">
                <Image src="/auth.avif" alt="auth" width={148} height={148} />
                <div className="py-2 flex flex-col gap-3">
                  <h2 className="text-3xl font-semibold">Login to your account</h2>
                  <p>You will be able to see your trades after logging in</p>
                  <Button className="text-bold text-white w-26">Login</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sell Dialog */}
      <Dialog open={!!sellPosition} onOpenChange={closeDialog}>
        <DialogContent className="hidden sm:block">
          <DialogHeader className="mb-4">
            <DialogTitle>
              Sell {sellPosition?.side.toUpperCase()} - {sellPosition?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Position Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Available Shares: {sellPosition?.shares}</p>
              <p className="text-sm text-gray-600">
                Current Price: ₹{sellPosition ? getCurrentPrice(sellPosition).toFixed(2) : "0.00"}
              </p>
            </div>

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

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 rounded-none border-none"
                  onClick={() => setSellQty(String(Math.max(1, parseInt(sellQty || "1") - 1)))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Enter quantity"
                  value={sellQty}
                  onChange={(e) => setSellQty(e.target.value)}
                  type="number"
                  min="1"
                  max={sellPosition?.shares}
                  className="border-none text-center focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 rounded-none border-none"
                  onClick={() => {
                    const maxShares = parseInt(sellPosition?.shares || "1");
                    const currentQty = parseInt(sellQty || "1");
                    setSellQty(String(Math.min(maxShares, currentQty + 1)));
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Limit Price Input */}
            {orderType === "limit" && (
              <div>
                <label className="block text-sm font-medium mb-2">Limit Price</label>
                <Input
                  placeholder="Enter limit price"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.00"
                />
              </div>
            )}

            {/* Estimated Proceeds */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">
                Estimated Proceeds: ₹{getEstimatedProceeds().toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSell}
              disabled={
                mutation.isPending ||
                !sellQty ||
                parseInt(sellQty) <= 0 ||
                (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0))
              }
            >
              {mutation.isPending ? "Placing order..." : "Confirm Sell"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Sheet */}
      {sellPosition && (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-lg sm:hidden z-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">
              Sell {sellPosition.side.toUpperCase()} - {sellPosition.title}
            </h2>
            <button onClick={closeDialog}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Position Info */}
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <p className="text-sm text-gray-600">Available: {sellPosition.shares} shares</p>
            <p className="text-sm text-gray-600">
              Current Price: ₹{getCurrentPrice(sellPosition).toFixed(2)}
            </p>
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

          {/* Quantity Input */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 px-3 rounded-none border-none"
                onClick={() => setSellQty(String(Math.max(1, parseInt(sellQty || "1") - 1)))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Enter quantity"
                value={sellQty}
                onChange={(e) => setSellQty(e.target.value)}
                type="number"
                min="1"
                max={sellPosition.shares}
                className="border-none text-center focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 px-3 rounded-none border-none"
                onClick={() => {
                  const maxShares = parseInt(sellPosition.shares);
                  const currentQty = parseInt(sellQty || "1");
                  setSellQty(String(Math.min(maxShares, currentQty + 1)));
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {orderType === "limit" && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Limit Price</label>
              <Input
                placeholder="Enter limit price"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                type="number"
                step="0.01"
                min="0.01"
                max="10.00"
              />
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm font-medium">
              Est. Proceeds: ₹{getEstimatedProceeds().toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSell}
              disabled={
                mutation.isPending ||
                !sellQty ||
                parseInt(sellQty) <= 0 ||
                (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0))
              }
            >
              {mutation.isPending ? "Placing..." : "Confirm Sell"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}