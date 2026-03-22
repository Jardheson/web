"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, X, Clock, Calendar, Tv } from "lucide-react";
import ChannelImage from "./ChannelImage";

interface Channel {
  id: string;
  name: string;
  logo: string;
  country: string;
  categories: string[];
  languages: string[];
  url: string;
  quality: string;
}

interface Program {
  id: string;
  title: string;
  start: Date;
  end: Date;
  durationMinutes: number;
  isLive: boolean;
  category: string;
  description: string;
  channelName: string;
  channelUrl: string;
  channelLogo: string;
}

// Função para gerar uma grade de programação mockada baseada no canal e hora atual
function generateMockPrograms(channel: Channel, baseTime: Date): Program[] {
  const programs: Program[] = [];
  
  // Arredondar baseTime para a última meia hora
  const startTime = new Date(baseTime);
  startTime.setMinutes(baseTime.getMinutes() < 30 ? 0 : 30);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  
  // Começar 2 horas atrás para permitir scroll para trás
  let currentTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
  
  // Gerar programas para 12 horas
  const endTime = new Date(startTime.getTime() + 10 * 60 * 60 * 1000);
  
  const newsTitles = ["Jornal Nacional", "Notícias Locais", "Manhã News", "Edição Especial", "Plantão Notícias"];
  const movieTitles = ["Filme: Ação Explosiva", "Sessão Pipoca: Comédia", "Cinema em Casa", "Super Estreia", "Filme: Drama"];
  const sportsTitles = ["Esporte Total", "Futebol Ao Vivo", "Resumo Esportivo", "Campeonato Nacional", "Mundo Motor"];
  const kidsTitles = ["Desenho Animado", "Aventuras Mágicas", "Hora de Brincar", "Série Jovem", "Animação Kids"];
  const docTitles = ["Documentário Natureza", "História Viva", "Mundo Selvagem", "Ciência e Tecnologia", "Planeta Terra"];
  const generalTitles = ["Programa de Variedades", "Talk Show", "Série Policial", "Novela das 8", "Reality Show"];
  
  // Escolher o pool baseado na categoria do canal
  let pool = generalTitles;
  if (channel.categories?.includes("news")) pool = newsTitles;
  else if (channel.categories?.includes("movies")) pool = movieTitles;
  else if (channel.categories?.includes("sports")) pool = sportsTitles;
  else if (channel.categories?.includes("kids") || channel.categories?.includes("animation")) pool = kidsTitles;
  else if (channel.categories?.includes("documentary")) pool = docTitles;

  // Gerar com seed simples baseado no nome do canal
  let seed = 0;
  for (let i = 0; i < channel.name.length; i++) {
    seed += channel.name.charCodeAt(i);
  }

  let idCounter = 0;
  while (currentTime < endTime) {
    // Duração aleatória: 30, 60, 90, ou 120 minutos
    const pseudoRandom = (seed + idCounter * 17) % 100;
    let durationMinutes = 30;
    if (pseudoRandom > 80) durationMinutes = 120;
    else if (pseudoRandom > 50) durationMinutes = 60;
    else if (pseudoRandom > 30) durationMinutes = 90;
    
    const progEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
    
    const titleIndex = (seed + idCounter * 7) % pool.length;
    
    programs.push({
      id: `${channel.id}-${idCounter}`,
      title: pool[titleIndex],
      start: new Date(currentTime),
      end: progEnd,
      durationMinutes,
      isLive: baseTime >= currentTime && baseTime < progEnd,
      category: channel.categories?.[0] || "Variedades",
      description: `Acompanhe a melhor programação em ${channel.name}.`,
      channelName: channel.name,
      channelUrl: channel.url,
      channelLogo: channel.logo
    });
    
    currentTime = progEnd;
    idCounter++;
  }
  
  return programs;
}

export default function EpgGuide({ channels }: { channels: Channel[] }) {
  const [now, setNow] = useState(new Date());
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Atualiza o "agora" a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Gerar epgData com base em um tempo inicial fixo para evitar re-renderizações a cada minuto
  const [epgBaseTime] = useState(() => new Date());
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const epgData = useMemo(() => {
    return channels.map(channel => ({
      channel,
      programs: generateMockPrograms(channel, epgBaseTime)
    }));
  }, [channels, epgBaseTime]);
  
  // Posição do indicador de tempo atual
  const baseTime = epgData[0]?.programs[0]?.start || new Date();
  
  // Constantes de layout responsivo
  // Usa um width menor no mobile
  const [minuteWidth, setMinuteWidth] = useState(4);
  const [channelColumnWidth, setChannelColumnWidth] = useState(120);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMinuteWidth(3); // Menos espaço por minuto no mobile
        setChannelColumnWidth(80); // Coluna de canal menor
      } else {
        setMinuteWidth(4);
        setChannelColumnWidth(120);
      }
    };
    
    // Initial call
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const HOUR_WIDTH = minuteWidth * 60;
  const ROW_HEIGHT = 80; // Aumentado para dar mais espaço e visibilidade

  // Calculando a posição atual
  const currentOffsetMinutes = (now.getTime() - baseTime.getTime()) / (1000 * 60);
  const currentLeftPos = currentOffsetMinutes * minuteWidth;

  // Rolar para a hora atual quando carregar
  useEffect(() => {
    if (containerRef.current) {
      // Tentar centralizar o horário atual
      const scrollPos = Math.max(0, currentLeftPos - window.innerWidth / 2 + channelColumnWidth);
      containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [currentLeftPos, channelColumnWidth]);

  // Gerar os marcadores de tempo no cabeçalho
  const timeHeaders = [];
  const startHeader = new Date(baseTime);
  for (let i = 0; i < 24; i++) { // 12 horas = 24 meias horas
    const t = new Date(startHeader.getTime() + i * 30 * 60 * 1000);
    timeHeaders.push(t);
  }

  const formatTime = (d: Date) => {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#141414] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative h-[85vh] min-h-[600px] md:min-h-[700px]">
      
      {/* Detalhes do Programa Selecionado (Estilo Claro TV topo) */}
      <div className="h-auto min-h-[140px] md:h-48 bg-gradient-to-r from-black via-[#1a1c29] to-[#0f1015] p-4 md:p-6 border-b border-white/10 flex-shrink-0 flex gap-4 md:gap-6 relative overflow-hidden">
        {selectedProgram ? (
          <>
            {/* Imagem de Fundo Dinâmica Desfocada baseada no logo do canal */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
              <div 
                className="w-full h-full bg-cover bg-center blur-xl transform scale-110"
                style={{ backgroundImage: `url(${selectedProgram.channelLogo})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            </div>

            <div className="hidden md:flex w-32 h-32 flex-shrink-0 bg-white/5 rounded-xl border border-white/10 p-2 items-center justify-center relative z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
               <ChannelImage src={selectedProgram.channelLogo} alt={selectedProgram.channelName} className="w-full h-full object-contain drop-shadow-md" />
            </div>

            <div className="flex-1 z-10 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1 md:mb-2">
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] md:text-xs font-bold rounded uppercase tracking-wider border border-primary/30">
                  {selectedProgram.category}
                </span>
                {selectedProgram.isLive && (
                  <span className="flex items-center gap-1 bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30 text-[10px] md:text-xs font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> AO VIVO
                  </span>
                )}
                <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-xs md:text-sm font-medium">
                  {formatTime(selectedProgram.start)} - {formatTime(selectedProgram.end)}
                </span>
                <span className="text-gray-500 text-xs md:text-sm font-medium hidden sm:inline">
                  • {selectedProgram.durationMinutes} min
                </span>
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-1 md:mb-2 line-clamp-1 drop-shadow-lg">{selectedProgram.title}</h2>
              <p className="text-gray-300 text-xs md:text-sm max-w-4xl line-clamp-2 hidden sm:block opacity-90">{selectedProgram.description}</p>
              
              <div className="mt-3 md:mt-4 flex gap-2 md:gap-3">
                <Link href={`/watch?url=${encodeURIComponent(selectedProgram.channelUrl)}&title=${encodeURIComponent(selectedProgram.channelName)}`} className="bg-gradient-to-r from-primary to-[#ff4081] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] text-white px-5 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 transition-all">
                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" /> Assistir
                </Link>
                <button 
                  onClick={() => setShowDetailsModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 transition-all border border-white/10 hover:border-white/30 backdrop-blur-md"
                >
                  <Info className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Detalhes</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10 text-center px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Info className="w-6 h-6 md:w-8 md:h-8 opacity-50" />
            </div>
            <p className="text-sm md:text-base font-medium">Selecione um programa no guia para ver os detalhes</p>
          </div>
        )}
        
        {/* Abstract background for header */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
      </div>

      {/* EPG Grid Container */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent relative" ref={containerRef}>
        <div className="flex relative w-max" style={{ width: `${channelColumnWidth + (12 * HOUR_WIDTH)}px` }}>
          
          {/* Coluna Fixa de Canais */}
          <div className="sticky left-0 z-50 bg-[#1a1c29] border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]" style={{ width: channelColumnWidth, minWidth: channelColumnWidth }}>
            {/* Header Vazio */}
            <div className="h-12 border-b border-white/10 bg-[#12131c]"></div>
            
            {/* Lista de Canais */}
            {epgData.map((row) => (
              <div 
                key={`ch-${row.channel.id}`} 
                className="flex items-center justify-center p-2 border-b border-white/5 bg-[#1a1c29]"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <Link href={`/watch?url=${encodeURIComponent(row.channel.url)}&title=${encodeURIComponent(row.channel.name)}`} className="w-full h-full flex flex-col items-center justify-center group relative z-10 p-1">
                  <div className="w-10 h-10 md:w-14 md:h-14 relative bg-white/5 rounded-md p-1 mb-1 shadow-inner flex items-center justify-center overflow-hidden">
                    <ChannelImage src={row.channel.logo} alt={row.channel.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[9px] md:text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center font-medium px-1">{row.channel.name}</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Área de Programação (Scrollável Horizontalmente) */}
          <div className="relative bg-[#12131c]" style={{ width: `${12 * HOUR_WIDTH}px` }}>
            {/* Linha do Tempo Atual (Vermelha) */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-40 shadow-[0_0_10px_rgba(239,68,68,0.8)] pointer-events-none"
              style={{ left: `${currentLeftPos}px` }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500"></div>
            </div>

            {/* Cabeçalho de Horários */}
            <div className="sticky top-0 z-[45] h-12 flex border-b border-white/10 bg-[#12131c]/95 backdrop-blur w-full">
              {timeHeaders.map((time, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 h-full flex items-center border-l border-white/5 px-2 md:px-3 text-[10px] md:text-xs font-bold text-gray-400"
                  style={{ width: `${minuteWidth * 30}px` }}
                >
                  {formatTime(time)}
                </div>
              ))}
            </div>

            {/* Linhas de Programas */}
            <div className="relative z-10 w-full">
              {epgData.map((row) => (
                <div key={`prog-row-${row.channel.id}`} className="relative border-b border-white/5" style={{ height: `${ROW_HEIGHT}px` }}>
                  {row.programs.map((prog) => {
                    const progOffsetMins = (prog.start.getTime() - baseTime.getTime()) / (1000 * 60);
                    const isSelected = selectedProgram?.id === prog.id;
                    const isPast = prog.end < now;
                    
                    return (
                      <div
                        key={prog.id}
                        onClick={() => setSelectedProgram(prog)}
                        className={`absolute top-1.5 bottom-1.5 rounded-lg cursor-pointer transition-all border overflow-hidden group
                          ${isSelected 
                            ? 'bg-gradient-to-r from-primary/30 to-[#ff4081]/30 border-primary z-30 shadow-[0_0_20px_rgba(255,0,85,0.4)]' 
                            : isPast
                              ? 'bg-white/5 border-white/5 hover:bg-white/10 z-10'
                              : 'bg-gradient-to-r from-[#222436] to-[#1a1c29] border-white/10 hover:border-white/30 hover:shadow-lg z-20'
                          }
                        `}
                        style={{
                          left: `${progOffsetMins * minuteWidth}px`,
                          width: `${(prog.durationMinutes * minuteWidth) - 2}px` // -2 for margin
                        }}
                      >
                        <div className={`p-2 h-full flex flex-col justify-center ${isPast ? 'opacity-50' : 'opacity-100'} ${isSelected ? 'scale-[1.02]' : ''} transition-transform z-10 relative overflow-hidden`}>
                          <h4 className={`text-[11px] md:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {prog.title}
                          </h4>
                          <p className="text-[9px] md:text-[10px] text-gray-400 truncate mt-0.5">
                            {formatTime(prog.start)} - {formatTime(prog.end)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Linhas de grade de fundo (meia em meia hora) */}
            <div className="absolute inset-0 z-0 pointer-events-none flex w-full">
               {timeHeaders.map((_, i) => (
                <div 
                  key={`grid-${i}`} 
                  className="flex-shrink-0 h-full border-l border-white/5"
                  style={{ width: `${minuteWidth * 30}px` }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedProgram && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1a1c29] to-[#0f1015] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Capa com Imagem do Canal Desfocada */}
            <div className="h-32 md:h-48 relative flex items-center justify-center bg-black/50 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125"
                style={{ backgroundImage: `url(${selectedProgram.channelLogo})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c29] via-transparent to-transparent"></div>
              
              <div className="w-20 h-20 md:w-28 md:h-28 relative z-10 bg-white/5 p-2 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
                <ChannelImage src={selectedProgram.channelLogo} alt={selectedProgram.channelName} className="w-full h-full object-contain" />
              </div>
              
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded uppercase tracking-wider border border-primary/30">
                  {selectedProgram.category}
                </span>
                {selectedProgram.isLive && (
                  <span className="flex items-center gap-1.5 bg-red-500/20 text-red-500 px-3 py-1 rounded border border-red-500/30 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> AO VIVO
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2">{selectedProgram.title}</h2>
              <p className="text-primary font-medium text-sm md:text-base mb-6 flex items-center gap-2">
                <Tv className="w-4 h-4" /> {selectedProgram.channelName}
              </p>
              
              <div className="flex flex-wrap gap-4 md:gap-8 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Data</p>
                    <p className="text-sm font-medium text-gray-200">Hoje</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Horário</p>
                    <p className="text-sm font-medium text-gray-200">
                      {formatTime(selectedProgram.start)} às {formatTime(selectedProgram.end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Duração</p>
                    <p className="text-sm font-medium text-gray-200">{selectedProgram.durationMinutes} min</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Sinopse</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {selectedProgram.description}
                  {/* Extensão de texto mockada para preencher mais o modal */}
                  {" "}Fique ligado na nossa programação para não perder nenhum detalhe deste evento. A melhor qualidade de imagem e som garantida para você e sua família no GlobePlay+.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Link 
                  href={`/watch?url=${encodeURIComponent(selectedProgram.channelUrl)}&title=${encodeURIComponent(selectedProgram.channelName)}`} 
                  className="flex-1 bg-gradient-to-r from-primary to-[#ff4081] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] text-white py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" /> Assistir Agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}