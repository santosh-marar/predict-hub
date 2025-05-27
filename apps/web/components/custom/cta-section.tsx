import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CTASection() {
  return (
    <section className="bg-[#262626] overflow-hidden h-[60vh]">
      <div className="max-w-7xl mx-auto relative h-full">
        <div className="px-6 pt-16 relative z-10">
          <div className="text-center">
            <h2 className="text-8xl text-white tracking-tight mb-12 font-sans">
              What will be the return
              <br />
              on your opinions?
            </h2>

            <Button
              className="bg-transparent border-2 border-white text-white rounded-full text-lg w-80 h-16"
            >
              Download App
              <ArrowRight size={32} className="ml-2 w-16 h-16" />
            </Button>
          </div>
        </div>

        {/* Left person image */}
        <div className="absolute left-0 bottom-0 w-80 h-80 opacity-60">
          <Image src="/person-left.avif" alt="left-person" fill />
        </div>

        {/* Right person image */}
        <div className="absolute right-0 bottom-0 w-80 h-80 opacity-60">
          <Image src="/person-right.avif" alt="right-person" fill />
        </div>
      </div>
    </section>
  );
}
