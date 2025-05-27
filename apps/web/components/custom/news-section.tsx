import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Quote } from "lucide-react";
import Image from "next/image";

const people = [
  {
    name: "Nazar",
    description:
      "Keep an eye on the happenings around you. Be it Politics, Sports, Entertainment and more.",
    type: "image",
    image: "/nazar.avif",
  },
  {
    name: "Khabar",
    description:
      "Understand the news without the noise. Get to the crux of every matter and develop an opinion.",
    type: "image",
    image: "/khabar.avif",
  },
  {
    name: "Jigar",
    description:
      "Have the courage to stand by your opinions about upcoming world events by investing in them.",
    type: "image",
    image: "/jigar.avif",
  },
  {
    name: "Sahar",
    description:
      "Have the patience to negotiate market ups and downs, and take a decision as events unfold.",
    type: "image",
    image: "/sabar.avif",
  },
];


export default function NewsSection() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main heading with quotation marks */}
        <div className="text-center mb-16">
          <h2 className="text-6xl font-semibold text-gray-900 leading-tight font-sans inline-flex items-start justify-center">
            <span className="inline">
              <Image
                src="/quotes.avif"
                alt="Opening Quote"
                width={48}
                height={48}
                className="inline-block mr-2 -mt-8"
              />
              News that creates trading
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;opportunity,
              everyday
              <Image
                src="/quotes.avif"
                alt="Closing Quote"
                width={48}
                height={48}
                className="inline-block ml-2 -mt-8 scale-x-[-1]"
              />
            </span>
          </h2>
        </div>

        {/* People profiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {people.map((person) => (
            <div
              key={person.name}
              className={`flex flex-col items-center justify-center text-center`}
            >
              <div className="relative mb-6">
                {person.type === "image" ? (
                  <Image
                    src={person.image}
                    alt={person.name}
                    width={328}
                    height={328}
                    className="-mb-34"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-300 to-purple-400 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gray-300 flex items-end justify-center">
                      <div className="w-32 h-40 bg-gray-400 rounded-t-full" />
                    </div>
                  </div>
                )}
              </div>

              {person.type === "image" ? (
                <Card className="shadow-none rounded-none border-none bg-white gap-0 text-center z-100 w-[256px]">
                  <CardHeader className="pb-0 mb-0">
                    <CardTitle className="text-2xl pb-0">
                      {person.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-2">
                    <p className="text-sm leading-relaxed font-sans">
                      {person.description}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans">
                    {person.name}
                  </h3>
                  <p className="text-sm leading-relaxed font-sans">
                    {person.description}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
