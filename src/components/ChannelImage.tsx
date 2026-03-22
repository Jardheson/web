"use client";

import { useState } from 'react';
import { Tv } from 'lucide-react';

interface ChannelImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ChannelImage({ src, alt, className = "" }: ChannelImageProps) {
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  
  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  // Se não tem source, ou deu erro, renderiza o placeholder
  if (!src || error || src === "") {
    return (
      <div className={`flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-md p-2 w-full h-full min-h-[60px] ${className}`}>
        <Tv className="w-6 h-6 md:w-8 md:h-8 text-gray-500 opacity-50 mb-1" />
        <span className="text-[9px] md:text-[10px] text-gray-400 font-bold truncate px-1 w-full text-center">
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
      onError={() => {
        console.warn(`Imagem de canal falhou ao carregar: ${src}`);
        setError(true);
      }}
      loading="lazy"
    />
  );
}
