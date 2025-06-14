import { Button } from "@repo/ui/components/button";
import Image from "next/image";

export default function DownloadApp() {
  return (
    <div className="p-4 rounded-xl bg-[#EDEDED] text-[#262626] flex gap-4 items-center">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          DOWNLOAD APP
          <br />
          FOR BETTER & <br />
          FASTER EXPERIENCE
        </h2>

        <Button
          variant="default"
          className="w-full bg-[#262626] hover:bg-gray-800"
        >
          Download Now
        </Button>
      </div>
      <Image
        src="/download.avif"
        alt="download app"
        width={132}
        height={132}
      />
    </div>
  );
}
