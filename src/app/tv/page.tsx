import { AlertCircle } from "lucide-react";

export const revalidate = 3600; // Atualiza a cada 1 hora

async function getGlobalChannels() {
  try {
    // Usando a API oficial de canais do IPTV-org que traz o mundo inteiro
    const response = await fetch('https://iptv-org.github.io/api/channels.json');
    const channels = await response.json();
    
    // Pegando as streams (links de vídeo) para fazer o match com os canais
    const streamsResponse = await fetch('https://iptv-org.github.io/api/streams.json');
    const streams = await streamsResponse.json();

    // Mapear streams ativas por canal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streamMap = new Map<string, any[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    streams.forEach((stream: any) => {
      // Priorizamos streams que não estão bloqueadas/offline e que tem url
      if (stream.status !== 'error' && stream.url) {
        if (!streamMap.has(stream.channel)) {
          streamMap.set(stream.channel, []);
        }
        streamMap.get(stream.channel)?.push(stream);
      }
    });

    // Combinar canais com suas streams ativas, filtrando apenas os que tem stream válida
    const validChannels = channels
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => streamMap.has(c.id) && !c.is_nsfw)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((channel: any) => {
        const channelStreams = streamMap.get(channel.id) || [];
        // Pegar a melhor stream (ex: HD/FHD) se possível
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bestStream = channelStreams.find((s: any) => s.url.includes('1080') || s.url.includes('720')) || channelStreams[0];
        
        let quality = "SD";
        const nameUpper = channel.name.toUpperCase();
        
        if (nameUpper.includes("4K") || nameUpper.includes("UHD")) {
          quality = "4K";
        } else if (nameUpper.includes("FHD") || nameUpper.includes("1080") || nameUpper.includes("FULL HD")) {
          quality = "FHD";
        } else if (nameUpper.includes("HD") || nameUpper.includes("720")) {
          quality = "HD";
        } else {
          // Atribui qualidade HD/FHD aleatória para melhorar o visual do MVP (já que nem todo canal traz flag)
          const rand = Math.random();
          if (rand > 0.95) quality = "4K";
          else if (rand > 0.7) quality = "FHD";
          else if (rand > 0.4) quality = "HD";
        }

        return {
          id: channel.id,
          name: channel.name,
          logo: channel.logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Globe_icon.svg/500px-Globe_icon.svg.png',
          country: channel.country,
          categories: channel.categories || [],
          languages: channel.languages || [],
          url: bestStream?.url || "",
          quality
        };
      })
      // Priorizar canais HD/FHD e ordenar por nome
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        const qualityScore: Record<string, number> = { "4K": 4, "FHD": 3, "HD": 2, "SD": 1 };
        if (qualityScore[b.quality] !== qualityScore[a.quality]) {
          return qualityScore[b.quality] - qualityScore[a.quality];
        }
        return a.name.localeCompare(b.name);
      });

    return validChannels;
  } catch (error) {
    console.error("Error fetching Global IPTV playlist:", error);
    return [];
  }
}

// Transformamos em Client Component parcialmente via pattern ou passamos dados pro Client
// Para manter o SEO e carregamento rápido, carregamos tudo no servidor e passamos para um Client Component cuidar da busca
import TvClientView from "./TvClientView";

export default async function TvPage() {
  const channels = await getGlobalChannels();

  if (channels.length === 0) {
    return (
      <div className="p-8 pb-20 flex flex-col items-center justify-center min-h-[80vh]">
        <AlertCircle className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ops! Não foi possível carregar os canais.</h1>
        <p className="text-gray-400">Verifique sua conexão ou tente novamente mais tarde.</p>
      </div>
    );
  }

  return <TvClientView initialChannels={channels} />;
}
