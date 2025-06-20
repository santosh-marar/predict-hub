"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Minus, Plus, Settings } from "lucide-react";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EventFormData {
  eventId: string;
  side: "yes" | "no";
  limitPrice: number;
  quantity: number;
  type: "buy" | "sell";
}

export default function TradingSidebar({eventId}: {eventId: string}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");
  const [price, setPrice] = useState(9.5);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const youPut = price * quantity;
  const youGet = selectedOption === "yes" ? 10.0 * quantity : 10.0 * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: EventFormData = {
      eventId: eventId,
      side: selectedOption,
      limitPrice: price,
      quantity: quantity,
      type: type,
    };

    onSubmit({
      ...formData,
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await api.post(`/order`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success(`Order placed successfully!`);
      // router.push("/dashboard/orders");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    },
  });

  const onSubmit = (data: EventFormData) => {
    mutation.mutate(data);
  };

  // All states available:
  const isLoading = mutation.isPending;

  return (
    <Card className="sticky top-6 shadow-none h-full rounded-2xl mt-6">
      <CardContent className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* YES/NO Toggle */}
          <div className="flex bg-white border rounded-full">
            <Button
              type="button"
              onClick={() => setSelectedOption("yes")}
              className={`flex-1 rounded-full ${
                selectedOption === "yes"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white hover:bg-gray-200 text-gray-700"
              }`}
            >
              Yes ₹9.5
            </Button>
            <Button
              type="button"
              onClick={() => setSelectedOption("no")}
              className={`flex-1 rounded-full ${
                selectedOption === "no"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white hover:bg-gray-200 text-gray-700"
              }`}
            >
              No ₹0.5
            </Button>
          </div>

          {/* Set Price Section */}
          <div>
            <Button
              type="button"
              variant={"outline"}
              className="rounded-full shadow-none"
            >
              Set Price
            </Button>

            <Card className="p-4 mt-2 shadow-none">
              {/* Price Input */}
              <div className="grid grid-cols-5 items-center space-y-2 gap-2 mb-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-medium">Price</label>
                  <p className="text-xs text-gray-500">0 qty available</p>
                </div>

                <div className="flex col-span-3 items-center border rounded-xl h-8 overflow-hidden p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-xl hover:text-blue-600 border-none focus:outline-none bg-[#f5f5f5]"
                    onClick={() => setPrice(Math.max(0.5, price - 0.5))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(Number.parseFloat(e.target.value) || 0)
                    }
                    step="0.5"
                    min="0.5"
                    className="border-0 text-center font-medium h-8 px-1 py-0 text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 p-0 rounded-xl hover:text-blue-600 border-none focus:outline-none bg-[#f5f5f5]"
                    onClick={() => setPrice(price + 0.5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="grid grid-cols-5 items-center space-y-2 gap-2 mb-4">
                <div className="space-y-1 col-span-2 flex items-center gap">
                  <label className="text-sm font-medium">Quantity</label>
                  <Settings className="h-4 w-4 text-gray-500" />
                </div>

                <div className="flex col-span-3 items-center border rounded-xl h-8 overflow-hidden p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-xl hover:text-blue-600 border-none focus:outline-none bg-[#f5f5f5]"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number.parseInt(e.target.value) || 1)
                    }
                    step="1"
                    min={1}
                    className="border-0 text-center font-medium h-8 px-1 py-0 text-sm focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 p-0 rounded-xl hover:text-blue-600 border-none focus:outline-none bg-[#f5f5f5]"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="font-semibold">₹{youPut.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">You put</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">
                    ₹{youGet.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">You get</div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                className="w-full rounded-xl font-semibold h-12 bg-blue-600 hover:bg-blue-700 text-white mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Placing order..." : "Place order"}
              </Button>
            </Card>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
