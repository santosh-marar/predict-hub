"use client";

import { Card, CardContent, CardHeader } from "@repo/ui/components/card";

export default function AboutEvent() {

  return (
    <Card className="shadow-none gap-1">
      <CardHeader className="text-[#262626] font-medium">
        <h2 className="text-xl font-semibold">About the event</h2>
      </CardHeader>
      <CardContent className="mb-0 py-0 space-y-6">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <h5 className="text-xs font-semibold text-[#262626]">
              Source of truth
            </h5>
            <p className="text-xs text-[#757575]">
              BTCUSDT(Binance) on Tradingview
              in.tradingview.com/chart/?symbol=BINANCE%3ABTCUSDT
            </p>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-[#262626]">
              Trading started on
            </h5>
            <p className="text-xs text-[#757575]">12 Jun, 2025</p>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-[#262626]">
              Event expires on
            </h5>
            <p className="text-xs text-[#757575]">12 Jun, 2025</p>
          </div>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-[#262626]">
            Event expires on
          </h5>
          <p className="text-xs text-[#757575]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro,
            voluptatem mollitia assumenda consequuntur quod dolorem. Excepturi,
            officia. Quibusdam voluptatum cupiditate rerum beatae voluptas
            recusandae, vitae suscipit reiciendis exercitationem possimus quas!
            Corporis, saepe. Reiciendis quae debitis labore dolorem, nostrum,
            dolor in repellendus natus consectetur voluptas, sint eveniet
            facere. Molestias magni modi odio placeat officiis! Laboriosam,
            voluptates facilis sit possimus quia neque.
          </p>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-[#262626]">Rules</h5>
          <p className="text-xs text-[#757575]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro,
            voluptatem mollitia assumenda consequuntur quod dolorem. Excepturi,
            officia. Quibusdam voluptatum cupiditate rerum beatae voluptas
            recusandae, vitae suscipit reiciendis exercitationem possimus quas!
            Corporis, saepe. Reiciendis quae debitis labore dolorem, nostrum,
            dolor in repellendus natus consectetur voluptas, sint eveniet
            facere. Molestias magni modi odio placeat officiis! Laboriosam,
            voluptates facilis sit possimus quia neque.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
