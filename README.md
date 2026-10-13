# 🎬 CineTrack – Filmes & Séries

> Aplicação Web Progressiva (PWA) moderna para descoberta, acompanhamento e gestão personalizada de filmes e séries, inspirada na experiência de plataformas de streaming como a Netflix.

🌐 **Aplicação Online (Produção):** [https://series-and-filmes.vercel.app](https://series-and-filmes.vercel.app)

---

## 📖 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades Principais](#-funcionalidades-principais)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Estrutura do Projeto](#-estrutura-do-projeto)
5. [Como Funciona a Atualização do Catálogo](#-como-funciona-a-atualização-do-catálogo)
6. [Instalação como PWA no Telemóvel](#-instalação-como-pwa-no-telemóvel)
7. [Configuração do Ambiente Local](#-configuração-do-ambiente-local)
8. [Deploy e Publicação na Vercel](#-deploy-e-publicação-na-vercel)
9. [Histórico de Versões](#-histórico-de-versões)

---

## 🌟 Visão Geral

O **CineTrack** foi originalmente desenvolvido para **uso pessoal**, com o objetivo de criar uma experiência de catálogo fluida, moderna e sem distrações para acompanhar filmes e séries.

No entanto, a aplicação foi concebida com uma arquitetura aberta e escalável: **qualquer pessoa pode utilizá-la livremente** através do link público ([https://series-and-filmes.vercel.app](https://series-and-filmes.vercel.app)) ao criar a sua própria conta gratuita na plataforma.

Cada utilizador tem o seu espaço completamente isolado e privado:
- **Registo Rápido e Gratuito:** Basta um email e password para começar.
- **Listas e Dados Pessoais:** As listas (*Quero Ver*, *A Ver*, *Visto*), notas privadas, avaliações pessoais e histórico de episódios pertencem exclusivamente à conta de cada pessoa.
- **Sincronização Cloud:** Toda a informação é guardada de forma segura na nuvem através do **Supabase**, sincronizando instantaneamente entre telemóvel, tablet e computador.

---

## 🚀 Funcionalidades Principais

### 1. 🏠 Página Inicial (`Home`)
- **Destaque Dinâmico (Hero Banner):**
  - Se tiveres uma série na secção **"A Ver"**, ela assume o topo da página com a indicação da Temporada e Episódio atuais e o botão direto **"Continuar a Ver"**.
  - Se não estiveres a ver nada de momento, apresenta a maior tendência da semana.
- **5 Secções de Destaque com Scroll Horizontal:**
  1. 🏆 **Melhores Filmes de Sempre:** As maiores obras-primas da história do cinema ordenadas pelas melhores avaliações mundiais (*The Shawshank Redemption*, *The Godfather*, etc.).
  2. ⭐ **Melhores Séries de Sempre:** As séries mais lendárias de todos os tempos ordenadas por classificação (*Breaking Bad*, *Chernobyl*, *Arcane*, etc.).
  3. 🔥 **Em Alta:** Os lançamentos e conteúdos com maior interesse do momento.
  4. 🎬 **Filmes Populares:** Os filmes mais vistos na atualidade.
  5. 📺 **Séries em Destaque:** As séries mais populares da semana.

### 2. 🔍 Pesquisa & Catálogo (`Search`)
- **Três Abas:** **"Tudo"**, **"Filmes"** e **"Séries"**.
- **Layout de Streaming (Estilo Netflix):**
  - Grelha em ecrã total (`netflix-grid`) com **3 colunas no telemóvel** (4 a 6 em ecrãs maiores).
  - Imagens com proporção cinematográfica uniforme (`aspect-ratio: 2/3`) e cantos arredondados, sem caixas de texto inferiores a desformatar as linhas.
  - Títulos e notas integrados em vinheta escura discreta na base do poster com animação suave de zoom ao tocar.
- **Catálogo Completo ("TODAS"):**
  - Lista sem restrições que carrega todo o catálogo global do TMDB por ordem de lançamento (do mais recente para o mais antigo).
  - Paginação com botão de **"Carregar Mais"** para navegar continuamente por dezenas de páginas.
- **Modal de Filtros Avançado (botão no topo direito):**
  - **Tipo:** Tudo, Filmes ou Séries.
  - **Ordenar por:**
    - *Mais Recentes* (por data de lançamento).
    - *⭐ Melhores Avaliados* (por pontuação média da crítica e do público).
  - **Ano de Lançamento:** Seletor de anos (2026, 2025, 2024, etc.).
  - **Categorias / Géneros:** Filtro por dezenas de géneros oficiais (Ação, Drama, Comédia, Ficção Científica, Animação, etc.).
  - Etiquetas visuais de filtros ativos com botão de remoção rápida (`✕`) e "Limpar tudo".

### 3. 📋 A Minha Lista (`MyList`)
- **3 Estados de Acompanhamento:**
  - 🔖 **Quero Ver** (`wishlist`): Conteúdos guardados para assistir mais tarde.
  - 👁️ **A Ver** (`currently_watching`): Conteúdos atualmente em reprodução.
  - ✅ **Visto** (`watched`): Conteúdos já concluídos.
- **Memorização de Aba:** A aplicação memoriza sempre a última aba visitada via `localStorage` e abre nela diretamente.
- **Filtros e Pesquisa Interna:**
  - Botão de filtros que permite filtrar por **Tipo** (Filmes / Séries / Todos).
  - Ordenação por: *Mais recentes adicionados*, *Mais antigos*, *Ordem Alfabética (A-Z ou Z-A)* e *Melhor avaliação*.
  - Campo de pesquisa rápida por texto para encontrar títulos instantaneamente na lista.
- **Remoção Segura:** A remoção ou mudança de estado de um item é feita exclusivamente dentro da página de detalhe, evitando toques acidentais nos cartões da lista.

### 4. 🎬 Detalhes de Filmes & Séries (`MediaDetail`)
- Capa em alta definição, banner de fundo, título original, ano de lançamento, géneros e sinopse completa em português.
- Trailer oficial do YouTube incorporado diretamente para reprodução imediata.
- Elenco principal com fotos e nomes dos atores/personagens.
- **Para Séries — Sistema Inteligente Temporada a Temporada:**
  - Contador de progresso baseado na temporada atual (ex: `Ep. 3 de 10 da Temporada 1`).
  - Botão **`+1 Ep` com Transição Automática de Temporada:** Quando chegas ao último episódio de uma temporada (ex: episódio 10 da T1), ao clicar em `+1`, a app avança automaticamente para a **Temporada 2, Episódio 1**.
  - Botão **`-1 Ep` com Regresso Inteligente:** Permite recuar até ao último episódio da temporada anterior se necessário.
  - Grelha interativa de temporadas com capas oficiais, ano de lançamento e número de episódios, destacando a temporada ativa.
- **Avaliação Pessoal & Notas:** Permite atribuir estrelas pessoais (1 a 10) e escrever notas privadas sobre cada filme ou série.

### 5. 👤 Perfil & Definições (`Profile`)
- Nome de utilizador e email associados à conta.
- Estatísticas do perfil (total de itens guardados em cada categoria).
- **Painel de Definições:**
  - Informações do tema escuro otimizado para ecrãs OLED.
  - Estado da sincronização na nuvem via Supabase.
  - Botão para limpar a cache offline do PWA.
- Terminar sessão de forma segura.
- Indicação da versão da aplicação no rodapé.

---

## 🛠️ Tecnologias Utilizadas

| Componente | Tecnologia | Finalidade |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Interface de utilizador reativa e tipada |
| **Bundler** | Vite 8 | Compilação ultrarrápida e suporte HMR |
| **PWA** | `vite-plugin-pwa` + Workbox | Funcionamento offline e instalação nativa |
| **Estilos** | Vanilla CSS + Design Tokens | Layout responsivo, modo escuro e fluidez móvel |
| **Ícones** | Lucide React | Ícones modernos e consistentes |
| **Autenticação & DB** | Supabase (PostgreSQL) | Registo, login JWT e persistência na nuvem |
| **Catálogo & Metadados** | The Movie Database (TMDB API v3) | Sinopses, capas, elencos, trailers e lançamentos |
| **Hospedagem** | Vercel | Deploy global e distribuição estática com CDN |

---

## 📁 Estrutura do Projeto

```
Series&Filmes/
├── public/                 # Assets estáticos, ícones PWA e manifesto
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx      # Barra de navegação inferior (Mobile-first)
│   │   │   └── Layout.tsx         # Estrutura base das páginas com PWA banner
│   │   └── ui/
│   │       ├── CompactMediaCard.tsx # Cartão de poster puro estilo Netflix
│   │       ├── MediaCard.tsx        # Cartão de mídia com metadados para scroll rows
│   │       ├── InstallPWA.tsx       # Banner interativo de instalação do PWA
│   │       └── LoadingSpinner.tsx   # Skeletons e loaders animados
│   ├── contexts/
│   │   └── AuthContext.tsx        # Contexto de autenticação com Supabase
│   ├── lib/
│   │   ├── supabase.ts            # Cliente Supabase e serviços de base de dados
│   │   └── tmdb.ts                # Cliente TMDB (descoberta, pesquisa, detalhes)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx          # Página de início de sessão
│   │   │   └── Register.tsx       # Página de registo de nova conta
│   │   ├── Home.tsx               # Página inicial com Hero e 5 categorias
│   │   ├── Search.tsx             # Catálogo global e filtros estilo streaming
│   │   ├── MyList.tsx             # Listas do utilizador (Quero Ver, A Ver, Visto)
│   │   ├── MediaDetail.tsx        # Detalhe de filme/série com gestão de episódios
│   │   └── Profile.tsx            # Perfil, estatísticas e definições
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript para TMDB, utilizadores e listas
│   ├── App.tsx                    # Rotas da aplicação (React Router)
│   ├── index.css                  # Folha de estilos principal e tokens de design
│   └── main.tsx                   # Ponto de entrada da aplicação
├── .env.example                   # Modelo de variáveis de ambiente necessárias
├── index.html                     # HTML principal com tags PWA e meta SEO
├── package.json                   # Dependências e scripts de execução
├── tsconfig.json                  # Configuração TypeScript
├── vercel.json                    # Regras de reescrita de rotas SPA na Vercel
└── vite.config.ts                 # Configuração do Vite e plugin PWA
```

---

## 🌐 Como Funciona a Atualização do Catálogo?

O catálogo do **CineTrack** é **100% automático e atualizado em tempo real**:

1. **Sem Necessidade de Atualização Manual:**
   - A aplicação comunica diretamente com a API global do **TMDB** (The Movie Database).
2. **Novos Lançamentos Automáticos:**
   - As consultas de descoberta ordenam por data de lançamento decrescente (`primary_release_date.desc` e `first_air_date.desc`).
   - A data do filtro é calculada dinamicamente com base no dia atual (`new Date()`). Sempre que um filme ou série estreia num novo dia, fica imediatamente no topo do catálogo.
3. **Novas Temporadas e Capas:**
   - Novas capas, adições de episódios a séries existentes e dados de elenco atualizam-se instantaneamente assim que são registados no TMDB.

---

## 📱 Instalação como PWA no Telemóvel

A aplicação foi desenvolvida como uma **Progressive Web App** e pode ser instalada no ecrã principal sem passar por lojas de aplicações:

### No Android (Google Chrome):
1. Abre [https://series-and-filmes.vercel.app](https://series-and-filmes.vercel.app) no Chrome.
2. Toca no aviso **"Instalar App"** que surge no topo, ou toca nos **3 pontos (menu)** do Chrome.
3. Seleciona **"Instalar aplicação"** ou **"Adicionar ao ecrã principal"**.
4. A app passará a abrir em ecrã total como uma aplicação nativa.

### No iPhone / iPad (Safari):
1. Abre o link no Safari.
2. Toca no botão de **Partilha** (ícone do quadrado com a seta para cima na barra inferior).
3. Desce a lista e toca em **"Adicionar ao Ecrã Principal"** (Add to Home Screen).
4. Toca em **Adicionar**. O ícone oficial do CineTrack aparecerá no ecrã.

---

## 💻 Configuração do Ambiente Local

Para executar o projeto no teu computador:

### 1. Pré-requisitos
- **Node.js** (versão 20 ou superior).
- Conta no **Supabase** (para a base de dados).
- Chave de API do **TMDB** (gratuita em [themoviedb.org](https://www.themoviedb.org/settings/api)).

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Cria um ficheiro `.env` na raiz do projeto com o seguinte conteúdo:
```env
# Supabase
VITE_SUPABASE_URL=https://teu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=tua_chave_anonima_supabase

# TMDB API
VITE_TMDB_API_KEY=tua_chave_api_tmdb
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acede a `http://localhost:5173`.

### 5. Compilar para Produção
```bash
npm run build
```

---

## 🚀 Deploy e Publicação na Vercel

O projeto está configurado para publicação instantânea na **Vercel**:

### Publicar Atualizações de Produção:
```powershell
node node_modules\vercel\dist\index.js --scope jpgomessantos1-4736 --prod --yes
```

Todas as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TMDB_API_KEY`, etc.) estão já configuradas no painel da Vercel.

---

## 🏷️ Histórico de Versões

- **`v1.4.0`**:
  - Adição dos dois novos destaques principais na Página Inicial: *Melhores Filmes de Sempre* e *Melhores Séries de Sempre* (ordenados por classificação histórica).
  - Adição do filtro de ordenação por avaliação (*⭐ Mais Bem Avaliados*) na aba de Pesquisa.
- **`v1.3.0`**:
  - Redesenho completo da grelha de Pesquisa para o estilo de catálogo de streaming (Netflix).
  - Imagens com proporção e altura matemática rigorosamente uniformes (`aspect-ratio: 2/3`) em ecrã total de 3 colunas móveis.
- **`v1.2.0`**:
  - Filtros avançados na aba "A Minha Lista" (*Quero Ver* e *Visto*).
  - Catálogo de pesquisa com paginação infinita e botão "Carregar mais".
- **`v1.1.0`**:
  - Destaque Hero inteligente na Página Inicial com suporte a *A Continuar a Ver*.
  - Transição automática de temporadas e contagem de episódios temporada a temporada.
  - Modal de Definições no Perfil.
- **`v1.0.0`**:
  - Lançamento inicial da aplicação PWA com integração TMDB e Supabase.
