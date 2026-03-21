"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";

export default function MusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, setPlaying } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-sidebar border-t border-white/10 z-50 flex items-center justify-between px-2 md:px-4">
      {/* Absolute thin progress bar for mobile */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full bg-secondary" 
          style={{ width: `${(progress / (duration || 1)) * 100}%` }} 
        />
      </div>

      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />

      {/* Track Info */}
      <div className="flex items-center gap-2 md:gap-4 w-[60%] md:w-1/3">
        <div className="w-10 h-10 md:w-14 md:h-14 relative rounded bg-white/10 overflow-hidden flex-shrink-0">
          <Image 
            src={currentTrack.image} 
            alt={currentTrack.title} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="truncate flex-1">
          <h4 className="text-xs md:text-sm font-bold text-white leading-tight truncate">{currentTrack.title}</h4>
          <p className="text-[10px] md:text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center w-[40%] md:w-1/3 max-w-md">
        <div className="flex items-center justify-end md:justify-center gap-4 md:gap-6 mb-0 md:mb-1 w-full">
          <button className="hidden md:block text-gray-400 hover:text-white transition"><SkipBack className="w-5 h-5" /></button>
          <button 
            className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-1" />}
          </button>
          <button className="hidden md:block text-gray-400 hover:text-white transition"><SkipForward className="w-5 h-5" /></button>
        </div>
        <div className="hidden md:flex w-full items-center gap-2">
          <span className="text-[10px] text-gray-400 min-w-[30px] text-right">{formatTime(progress)}</span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-secondary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="text-[10px] text-gray-400 min-w-[30px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="hidden md:flex items-center justify-end gap-4 w-1/3 text-gray-400">
        <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition">
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
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
          className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
    </div>
  );
}
