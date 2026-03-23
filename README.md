# Streaming Platform

Uma plataforma de streaming moderna construída com Next.js que permite aos usuários assistir a TV, filmes, músicas, séries e novelas em um único lugar.

<img width="2760" height="1586" alt="image" src="https://github.com/user-attachments/assets/8a607106-a365-447c-8dbf-91641dac7300" />

✒️ Autor Jardheson Oliveira Software Engineer

"Código é poesia escrita para máquinas, mas lida por humanos."

## 📋 Descrição

Esta é uma aplicação full-stack de streaming que oferece uma experiência integrada para consumir diversos tipos de conteúdo de mídia. A plataforma inclui suporte para:

- 📺 **TV ao Vivo** - Transmissão de canal de TV
- 🎬 **Filmes** - Catálogo de filmes
- 🎵 **Música** - Reprodução de áudio com player integrado
- 📻 **Rádio** - Streaming de rádio
- 👶 **Conteúdo Infantil** - Seção dedicada para crianças
- 📺 **Séries** - Catálogo de séries e shows
- 📰 **Novelas** - Transmissão de novelas

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js** 16.2.1 - Framework React com renderização server-side
- **React** 19.2.4 - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** 4 - Estilização utility-first
- **Zustand** - Gerenciamento de estado global

### Reprodução de Mídia
- **React Player** - Player de vídeo universal
- **HLS.js** - Reprodução de streams HLS
- **Lucide React** - Ícones SVG

### API & Backend
- **Apollo Client** - Cliente GraphQL
- **WatchMode API** - Integração com dados de conteúdo

### Parsing
- **iptv-playlist-parser** - Parser de playlists IPTV

### Cookies
- **js-cookie** - Gerenciamento de cookies

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página inicial
│   ├── favorites/           # Página de favoritos
│   ├── tv/                  # Página de TV ao vivo
│   ├── movies/              # Catálogo de filmes
│   ├── shows/               # Catálogo de séries
│   ├── music/               # Reprodução de música
│   ├── radio/               # Streaming de rádio
│   ├── novelas/             # Catálogo de novelas
│   ├── kids/                # Conteúdo infantil
│   ├── search/              # Página de busca
│   ├── login/               # Autenticação
│   ├── register/            # Registro de usuário
│   ├── watch/               # Página de reprodução
│   ├── watchmode-details/   # Detalhes do WatchMode
│   └── api/
│       └── watchmode/       # Endpoint para API
├── components/
│   ├── Carousel.tsx         # Componente carrossel
│   ├── VideoPlayer.tsx      # Player de vídeo
│   ├── MusicPlayer.tsx      # Player de música
│   ├── EpgGuide.tsx         # Guia de programação
│   ├── ChannelImage.tsx     # Imagem de canal
│   ├── TrackImage.tsx       # Imagem de faixa
│   ├── Sidebar.tsx          # Barra lateral
│   ├── LayoutWrapper.tsx    # Wrapper de layout
│   └── Providers.tsx        # Provedores (contexto, temas)
└── store/
    ├── favoritesStore.ts    # Estado de favoritos
    └── playerStore.ts       # Estado do player
```

## 🚀 Começando

### Pré-requisitos
- **Node.js** 18+ 
- **npm** ou **yarn**

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd web
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Adicione suas chaves de API (WatchMode, etc.)

### Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

### Build para Produção

```bash
npm run build
npm start
```

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm start` | Inicia o servidor em produção |
| `npm run lint` | Verifica erros de linting com ESLint |

## 🎯 Funcionalidades Principais

### Autenticação
- Sistema de login e registro de usuários
- Gerenciamento de sessão com cookies

### Reprodução de Mídia
- Suporte para múltiplos formatos de vídeo
- Streaming de áudio com player integrado
- Controles de player personalizados

### Favoritos
- Sistema de favoritos persistente com Zustand
- Salvar e recuperar conteúdo favorito

### Busca
- Busca integrada no WatchMode
- Detalhes detalhados de conteúdo

### Guia de Programação
- EPG (Eletronic Program Guide) para TV ao vivo
- Informações de canal e programação

## 🔐 Segurança

- TypeScript para tipagem segura
- Validação de entrada com ESLint
- Gestão segura de cookies

## 📚 Documentação

Para mais informações, visite:
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Zustand](https://github.com/pmndrs/zustand)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuição

As contribuições são bem-vindas! Por favor:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -am 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📧 Contato

Para dúvidas ou sugestões, entre em contato com:
- **Jardheson Oliveira**

---

**Última atualização:** Março de 2026
