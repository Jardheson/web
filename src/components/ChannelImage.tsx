import { useState } from 'react';
import { Tv } from 'lucide-react';

interface ChannelImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ChannelImage({ src, alt, className = "" }: ChannelImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-md ${className}`}>
        <Tv className="w-8 h-8 text-gray-500 opacity-50 mb-1" />
        <span className="text-[10px] text-gray-500 font-bold truncate px-2 w-full text-center">
          {alt}
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
