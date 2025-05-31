// @ts-nocheck
import { useState, useRef, useEffect } from "react";

export default function VideoPlayer() {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e) => {
      console.error("Video error:", e);
      setVideoError(true);
    };

    const handleCanPlay = () => {
    };

    // Add event listeners
    video.addEventListener("error", handleError);
    video.addEventListener("canplay", handleCanPlay);

    // Force load the video
    video.load();

    // Cleanup
    return () => {
      video.removeEventListener("error", handleError);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  if (videoError) {
    return (
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-80 h-[600px] bg-black rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white text-center p-4 rounded-[2rem]">
              <div className="space-y-4">
                <div className="text-6xl">📱</div>
                <p className="text-lg font-semibold">Video Unavailable</p>
                <p className="text-sm text-gray-300">
                  Unable to load info-video.mp4
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="relative">
        {/* Phone-like container */}
        <div className="w- h-[600px] bg-[#262626] rounded-[3rem] p-4 shadow-2xl shadow-gray-700 shadow-xs overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain rounded-[2rem] bg-[#262626] "
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={(e) => {
              console.error("Video failed to load:", e);
              setVideoError(true);
            }}
          >
            <source src="/info-video.mp4" type="video/mp4" />
            <source src="/info-video.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </div>
  );
}
