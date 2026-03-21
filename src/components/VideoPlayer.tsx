"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  url: string;
  controls?: boolean;
  playing?: boolean;
}

export default function VideoPlayer({ url, controls = true, playing = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<{height: number, bitrate: number, level: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls;

    const loadVideo = () => {
      // HLS.js is supported
      if (Hls.isSupported()) {
        hls = new Hls({
          // Reduzindo o risco de erro de CORS em algumas transmissões públicas
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          xhrSetup: (xhr, url) => {
            xhr.withCredentials = false;
          },
          // Habilita ABR (Adaptive Bitrate) para escolher a melhor qualidade automaticamente
          capLevelToPlayerSize: false,
        });
        
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const availableQualities = hls.levels.map((l, index) => ({
            height: l.height,
            bitrate: l.bitrate,
            level: index
          }));
          setQualities(availableQualities.sort((a, b) => b.height - a.height));

          if (playing) {
            video.play().catch(e => {
              console.log("Autoplay blocked:", e);
              // Alguns navegadores bloqueiam autoplay, deixamos pausado se falhar
            });
          }
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Erro de rede ao tentar carregar a transmissão.");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Erro na mídia da transmissão.");
                hls.recoverMediaError();
                break;
              default:
                setError("A transmissão está offline ou bloqueada no momento.");
                hls.destroy();
                break;
            }
          }
        });
        
        hlsRef.current = hls;
      } 
      // Para Safari (iOS) que suporta HLS nativamente
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          if (playing) {
            video.play().catch(e => console.log("Autoplay blocked:", e));
          }
        });
      } else {
        setError("Seu navegador não suporta reprodução de HLS.");
      }
    };

    loadVideo();

    return () => {
      if (hls) {
        hls.destroy();
      }
      hlsRef.current = null;
    };
  }, [url, playing]);

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-8 text-center">
        <p className="text-red-500 mb-2 font-bold text-xl">Transmissão Indisponível</p>
        <p className="text-gray-400">{error}</p>
        <p className="text-sm text-gray-500 mt-4">Canais abertos do IPTV-org podem ficar offline frequentemente.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={controls}
        autoPlay={playing}
        playsInline
      />
      
      {/* Custom Quality Selector UI (sobreposto ao vídeo) */}
      {controls && qualities.length > 0 && (
        <div className="absolute bottom-16 right-4 z-50">
          <button 
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="bg-black/80 text-white px-3 py-1.5 rounded text-sm font-semibold border border-white/20 hover:bg-black transition flex items-center gap-2"
          >
            {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.level === currentQuality)?.height}p`}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          
          {showQualityMenu && (
            <div className="absolute bottom-full mb-2 right-0 bg-black/90 border border-white/20 rounded overflow-hidden min-w[120px] shadow-2xl flex flex-col">
              <button
                onClick={() => changeQuality(-1)}
                className={`px-4 py-2 text-left text-sm hover:bg-white/20 transition ${currentQuality === -1 ? 'text-primary font-bold bg-white/10' : 'text-white'}`}
              >
                Auto
              </button>
              {qualities.map((q) => (
                <button
                  key={q.level}
                  onClick={() => changeQuality(q.level)}
                  className={`px-4 py-2 text-left text-sm hover:bg-white/20 transition ${currentQuality === q.level ? 'text-primary font-bold bg-white/10' : 'text-white'}`}
                >
                  {q.height}p <span className="text-[10px] text-gray-400 ml-2">{(q.bitrate / 1000000).toFixed(1)} Mbps</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
