"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  controls?: boolean;
  playing?: boolean;
}

export default function VideoPlayer({ url, controls = true, playing = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<{height: number, bitrate: number, level: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
            video.play().then(() => setIsPlaying(true)).catch(e => {
              console.log("Autoplay blocked:", e);
              setIsPlaying(false);
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
            video.play().then(() => setIsPlaying(true)).catch(e => {
              console.log("Autoplay blocked:", e);
              setIsPlaying(false);
            });
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
        setShowQualityMenu(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setIsControlsVisible(false);
      setShowQualityMenu(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error("Erro ao tentar tela cheia:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

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
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-black flex items-center justify-center group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        controls={false} // Desabilita controles nativos do navegador
        autoPlay={playing}
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Custom Video Controls (Estilo Globoplay) */}
      {controls && (
        <div 
          className={`absolute bottom-0 left-0 right-0 px-4 md:px-8 py-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 flex flex-col justify-end ${
            isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Ao vivo indicator (opcional/decorativo para canais de tv) */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Ao Vivo</span>
          </div>

          <div className="flex items-center justify-between w-full">
            {/* Left Controls (Play/Pause, Volume) */}
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors focus:outline-none"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group/volume relative">
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-primary transition-colors focus:outline-none"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                
                {/* Volume Slider (Aparece no hover em desktop) */}
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-in-out flex items-center h-full">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, #ff0055 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Controls (Quality, Fullscreen) */}
            <div className="flex items-center gap-4 md:gap-6 relative">
              
              {/* Quality Settings */}
              {qualities.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-primary transition-colors focus:outline-none flex items-center gap-1.5"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-4 bg-black/95 border border-white/10 rounded-xl overflow-hidden min-w-[140px] shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col backdrop-blur-md">
                      <div className="px-4 py-2 border-b border-white/10 text-xs text-gray-400 font-bold uppercase tracking-wider">Qualidade</div>
                      <button
                        onClick={() => changeQuality(-1)}
                        className={`px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${currentQuality === -1 ? 'text-primary font-bold' : 'text-white'}`}
                      >
                        Automático
                        {currentQuality === -1 && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                      </button>
                      {qualities.map((q) => (
                        <button
                          key={q.level}
                          onClick={() => changeQuality(q.level)}
                          className={`px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${currentQuality === q.level ? 'text-primary font-bold' : 'text-white'}`}
                        >
                          {q.height}p
                          {currentQuality === q.level && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen Toggle */}
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-primary transition-colors focus:outline-none"
              >
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
