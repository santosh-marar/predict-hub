
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gray-50 pb-0 relative">
      {/* Wave background at bottom - behind everything */}
      <div className="absolute bottom-0 left-0 w-full z-0">
        <Image
          src="/waves.svg"
          alt="wave background"
          width={1280}
          height={175}
          className="mx-auto"
        />
      </div>

      {/* Main content - above the wave */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-7xl leading-tight">India's Leading</h1>
              <h2 className="text-6xl leading-tight">Game of Skill</h2>
            </div>

            <p className="text-xl text-gray-600">
              Sports, Entertainment, Economy or Finance.
            </p>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="px-8 py-3 text-black border-gray-300 rounded-xs"
              >
                Download App
              </Button>
              <Button
                asChild
                className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-xs"
              >
                <Link href="/events"> Trade Online</Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" />
              <span>For 18 years and above only</span>
            </div>
          </div>

          {/* Right content - Floating prediction cards */}
          <div className="relative z-20">
            <Image
              src="/home-hero-section.avif"
              alt="prediction card"
              width={600}
              height={600}
              className="bottom-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
