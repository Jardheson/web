"use client";

import { useState } from "react";
import { Music } from "lucide-react";

interface TrackImageProps {
  src: string;
  alt: string;
  className?: string;
  trackId: string;
}

export default function TrackImage({ src, alt, className = "", trackId }: TrackImageProps) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState(src);

  // Derive state from props instead of using useEffect
  if (src !== prevSrc) {
    setPrevSrc(src);
    setCurrentSrc(src);
    setError(false);
  }

  if (!currentSrc || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white/5 border border-white/10 w-full h-full ${className}`}>
        <Music className="w-1/2 h-1/2 text-gray-500 opacity-50" />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        // Fallback to Unsplash abstract music image if Audius image fails
        if (currentSrc !== `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80&random=${trackId}`) {
          setCurrentSrc(`https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80&random=${trackId}`);
        } else {
          setError(true);
        }
      }}
      loading="lazy"
    />
  );
}
