"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Mic2, ListMusic, MonitorSpeaker, Heart } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import TrackImage from "@/components/TrackImage";

export default function MusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, setPlaying } = usePlayerStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<0 | 1 | 2>(0); // 0: off, 1: all, 2: one

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const isCurrentFavorite = isFavorite(currentTrack.id);

  const toggleFavorite = () => {
    if (isCurrentFavorite) {
      removeFavorite(currentTrack.id);
    } else {
      addFavorite({
        id: currentTrack.id,
        title: currentTrack.title,
        subtitle: currentTrack.artist,
        image: currentTrack.image,
        type: 'music',
        url: `/music`
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[72px] md:h-[90px] bg-black border-t border-white/10 z-50 flex items-center justify-between px-2 md:px-4">
      {/* Absolute thin progress bar for mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear" 
          style={{ width: `${(progress / (duration || 1)) * 100}%` }} 
        />
      </div>

      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (repeatMode === 2 && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
          } else {
            setPlaying(false);
          }
        }}
      />

      {/* Track Info */}
      <div className="flex items-center gap-2 md:gap-4 w-[60%] md:w-1/3">
        <div className="w-10 h-10 md:w-16 md:h-16 relative rounded-md bg-white/10 overflow-hidden flex-shrink-0 shadow-lg group">
          <TrackImage 
            src={currentTrack.image} 
            alt={currentTrack.title} 
            trackId={currentTrack.id}
            className={`w-full h-full object-cover ${isPlaying ? 'scale-110' : ''} transition-transform duration-700`}
          />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h4 className="text-xs md:text-sm font-bold text-white leading-tight truncate hover:underline cursor-pointer" title={currentTrack.title}>{currentTrack.title}</h4>
          <p className="text-[10px] md:text-xs text-gray-400 truncate hover:underline cursor-pointer" title={currentTrack.artist}>{currentTrack.artist}</p>
        </div>
        <button 
          onClick={toggleFavorite}
          className={`flex ml-1 md:ml-2 transition-all hover:scale-110 flex-shrink-0 ${isCurrentFavorite ? 'text-primary' : 'text-[#a7a7a7] hover:text-white'}`}
          title={isCurrentFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          aria-label={isCurrentFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isCurrentFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center w-auto md:w-[40%] max-w-[722px]">
        <div className="flex items-center justify-end md:justify-center gap-4 md:gap-6 mb-1 w-full">
          {/* Shuffle Button */}
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className={`hidden md:flex items-center justify-center w-8 h-8 transition ${isShuffle ? 'text-[#1ed760]' : 'text-[#a7a7a7] hover:text-white'}`}
            aria-label="Ordem aleatória"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && <div className="absolute mt-6 w-1 h-1 bg-[#1ed760] rounded-full"></div>}
          </button>

          {/* Previous */}
          <button className="hidden md:flex text-[#a7a7a7] hover:text-white transition w-8 h-8 items-center justify-center" aria-label="Voltar">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause */}
          <button 
            className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar" : "Tocar"}
          >
            {isPlaying ? <Pause className="w-5 h-5 md:w-4 md:h-4 fill-black" /> : <Play className="w-5 h-5 md:w-4 md:h-4 fill-black ml-1" />}
          </button>

          {/* Next */}
          <button className="hidden md:flex text-[#a7a7a7] hover:text-white transition w-8 h-8 items-center justify-center" aria-label="Avançar">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Button */}
          <button 
            onClick={() => setRepeatMode((prev) => (prev + 1) % 3 as 0 | 1 | 2)}
            className={`hidden md:flex items-center justify-center w-8 h-8 transition relative ${repeatMode > 0 ? 'text-[#1ed760]' : 'text-[#a7a7a7] hover:text-white'}`}
            aria-label="Repetir"
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 2 && <span className="absolute text-[8px] font-bold bg-black rounded-full w-3 h-3 flex items-center justify-center -top-1 -right-1 border border-black text-[#1ed760]">1</span>}
            {repeatMode > 0 && <div className="absolute mt-6 w-1 h-1 bg-[#1ed760] rounded-full"></div>}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:flex w-full items-center gap-2 px-4">
          <span className="text-[11px] text-[#a7a7a7] min-w-[40px] text-right font-mono">{formatTime(progress)}</span>
          <div className="group relative flex-1 flex items-center h-3">
            <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={progress}
              onChange={handleSeek}
              className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white group-hover:bg-[#1ed760] transition-colors"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              />
            </div>
            {/* Custom Thumb that appears on hover */}
            <div 
              className="absolute h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity pointer-events-none"
              style={{ left: `calc(${(progress / (duration || 1)) * 100}% - 6px)` }}
            />
          </div>
          <span className="text-[11px] text-[#a7a7a7] min-w-[40px] font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls (Right Side) */}
      <div className="hidden md:flex items-center justify-end gap-3 w-[30%] text-[#a7a7a7] pr-2">
        <button className="w-8 h-8 flex items-center justify-center hover:text-white transition relative group">
          <Mic2 className="w-[18px] h-[18px]" />
          <span className="absolute -top-8 bg-[#282828] text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Letra</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center hover:text-white transition relative group">
          <ListMusic className="w-[18px] h-[18px]" />
          <span className="absolute -top-8 bg-[#282828] text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Fila</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center hover:text-white transition relative group">
          <MonitorSpeaker className="w-[18px] h-[18px]" />
          <span className="absolute -top-8 bg-[#282828] text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Conectar a um dispositivo</span>
        </button>

        <div className="flex items-center group relative ml-1">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="w-8 h-8 flex items-center justify-center hover:text-white transition"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
          </button>
          <div className="relative flex items-center w-24 h-3 ml-1">
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (Number(e.target.value) > 0) setIsMuted(false);
              }}
              className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white group-hover:bg-[#1ed760] transition-colors"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <div 
              className="absolute h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity pointer-events-none"
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
