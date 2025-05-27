import { Card, CardContent } from "@repo/ui/components/card";
import { ArrowRight } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start">
          {/* Left heading */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <h2 className="text-4xl font-bold text-black mb-12 leading-tight">
              What's
              <br />
              new in
              <br />
              Probo?
            </h2>
            <ArrowRight className="w-12 h-12 text-black text-right" />
          </div>

          {/* Feature cards grid */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trust & Safety Card */}
            <Card className="bg-[#262626] text-white border-0 rounded-2xl overflow-hidden rounded-xs">
              <CardContent className="p-6 h-full flex flex-col ">
                <h3 className="text-xl font-bold mb-4 leading-tight">
                  Probo Trust &<br />
                  Safety
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed flex-grow">
                  Be it loss protection or data security, Probo is user first
                  always. Check out the latest on responsible trading.
                </p>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="w-20 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-3 h-8 bg-gray-500 rounded-full"></div>
                      <div className="w-3 h-6 bg-gray-500 rounded-full"></div>
                      <div className="w-3 h-7 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exiting Trades Card */}
            <Card className="bg-[#262626] text-white border-0 rounded-2xl overflow-hidden rounded-xs">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 leading-tight">
                  Exiting trades is
                  <br />
                  your choice
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed flex-grow">
                  The 'Exit' feature gives the user an opportunity to exit from
                  the current trade and helps in controlling your losses and
                  maximising the profit.
                </p>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="w-20 h-16 flex items-center justify-center">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-6 bg-red-500 rounded"></div>
                        <div className="w-2 h-8 bg-blue-500 rounded"></div>
                        <div className="w-2 h-4 bg-red-500 rounded"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-6 h-3 bg-yellow-500 rounded"></div>
                        <div className="w-4 h-3 bg-orange-500 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-6 grid lg:grid-cols-6 gap-8">
            {/* Market Orders Card */}
            <Card className="bg-[#262626] text-white border-0 rounded-2xl overflow-hidden lg:col-span-4 rounded-xs">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 leading-tight">
                  Market Orders
                  <br />
                  and Instant Exit
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed flex-grow">
                  Market orders are a fast and reliable method to buy or exit a
                  trade in a fast-moving market. With market orders, quantities
                  are matched almost instantly after placing an order at the
                  best available price. Come test drive.
                </p>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="w-20 h-16 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <div className="w-4 h-4 bg-gray-600 rounded"></div>
                      <div className="w-4 h-6 bg-green-500 rounded"></div>
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Power of Prediction Markets Card */}
            <Card className="bg-[#262626] text-white border-0 rounded-2xl overflow-hidden lg:col-span-2 rounded-xs">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 leading-tight">
                  The Power of
                  <br />
                  Prediction
                  <br />
                  Markets
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed flex-grow">
                  Check out case studies, research articles and the utility of
                  Probo events
                </p>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="w-20 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="w-12 h-10 bg-gray-500 rounded-lg"></div>
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
