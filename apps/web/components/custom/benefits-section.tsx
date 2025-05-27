import Image from "next/image";

export default function BenefitsSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main heading */}
        <div className="mb-16">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight">
            Smart choices, responsible play.
            <br />
            Probo puts you first.
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Fastest news feed */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <Image src="/globe.avif" alt="exit" width={75} height={75} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Fastest news feed in the game
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Probo is all about understanding the world around us and bene
                fitting from our knowledge. Everything on Probo is based on real
                events that you can learn about, verify and follow yourself.
              </p>
            </div>
          </div>

          {/* All the news without noise */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <Image src="/tip.avif" alt="exit" width={75} height={75} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                All the news without the noise
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our experts go through tons of information to get to the very
                core of a world event. They help you form well-informed
                perspectives about events but also a better understanding of the
                world around us.
              </p>
            </div>
          </div>

          {/* Power to exit */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <Image src="/exit.avif" alt="exit" width={75} height={75} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                The power to exit, anytime
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Probo is a skill-based gaming platform that gives you full
                control over your choices. Just like in any strategy-driven
                game, Probo allows you to exit an event if it's not aligning
                with your expectations, helping you make smarter decisions.
              </p>
            </div>
          </div>

          {/* Pulse of society */}
          <div className="space-y-6">
            <div className="flex justify-center">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-sm">18+</div>
              </div> */}
              <Image src="/18+.avif" alt="18+" width={75} height={75} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                The pulse of society is on Probo
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Beyond sharpening your decision-making skills, Probo helps you
                tap into collective market sentiment. Gain insights into what
                people are thinking, analyze trends, and engage with events in a
                responsible way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
