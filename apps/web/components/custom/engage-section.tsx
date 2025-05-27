"use client";

import VideoPlayer from "./video-engage";

export default function EngageSection() {
  return (
    <section className="bg-[#262626] text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-4xl font-light">
                <span className="text-gray-400">Samachar</span>{" "}
                <span className="text-gray-400">Vichaar</span>{" "}
                <span className="text-white font-bold">Vyapaar</span>
              </div>

              <h2 className="text-4xl font-bold">Engage and grow</h2>

              <p className="text-xl text-gray-300 leading-relaxed">
                Apply your knowledge to real-world events and make informed
                choices to enhance your experience.
              </p>
            </div>
          </div>
          <VideoPlayer />
        </div>
      </div>
    </section>
  );
}
