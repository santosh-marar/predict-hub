import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { TrendingUp } from "lucide-react";

export default function ControlSection() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Main heading */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-gray-900 leading-tight">
              Stay in control —
            </h1>
            <div className="text-5xl font-bold text-gray-900 leading-tight">
              <span className=" rounded-lg inline-block">
                play what you like,
              </span>
              <br />
              <span className=" rounded-lg inline-block mt-2">
                when you like.
              </span>
            </div>
          </div>

          {/* Right side - Prediction cards in grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {/* India Inflation Card */}
            <Card className="bg-white shadow-md border-0 rounded-xl overflow-hidden">
              <CardContent>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🇮🇳</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-gray-600 font-medium">
                        1117 traders
                      </span>
                    </div>
                    <p className="text-gray-900 h-14 font-medium text-sm leading-tight mb-3">
                      India's inflation rate to be 3.2% or more in May?
                    </p>
                    <div className="flex items-center justify-between  gap-2">
                      <Button className=" w-1/2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg h-8">
                        Yes ₹75
                      </Button>
                      <Button className="w-1/2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg h-8">
                        No ₹25
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GST Collection Card */}
            <Card className="bg-white shadow-md border-0 rounded-xl overflow-hidden">
              <CardContent>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-gray-600 font-medium">
                        25 traders
                      </span>
                    </div>
                    <p className="text-gray-900 h-14 font-medium text-sm leading-tight mb-3">
                      Will India's GST gross collection be ₹2.4 lakh crore or
                      more for May 2025?
                    </p>
                    <div className="flex items-center justify-between  gap-2">
                      <Button className=" w-1/2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg h-8">
                        Yes ₹3
                      </Button>
                      <Button className=" w-1/2 bg-red-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg h-8">
                        No ₹7
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* South Korean Election Card - spans both columns */}
            <Card className="bg-white shadow-md border-0 rounded-xl overflow-hidden col-span-2">
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🗳️</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-gray-600 font-medium">
                        629 traders
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm leading-tight mb-3">
                      Will Han Duck-soo be elected as the President in the 2025
                      South Korean Election?
                    </p>
                    <div className="flex gap-2">
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg h-8 min-w-[70px]">
                        Yes ₹0.5
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg h-8 min-w-[70px]">
                        No ₹9.5
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
