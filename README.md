# CABEÇÃO — Documentação Completa do Site para GitHub

Este arquivo consolida todas as informações técnicas, visuais e de publicação do site **CABEÇÃO — Simulador de Baralho & Gabarito** para versionamento no GitHub, incluindo o arquivo `index.html`, identidade visual, fontes, paleta de cores, logotipos, ícones recortados, miniaturas das cartas e demais artefatos.

---

## 1. Visão Geral do Projeto

- **Nome do App**: Cabeção — Simulador de Baralho & Iframe
- **Stack**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Express (`server.ts`)
- **Baralho**: 216 cartas organizadas em 5 casas principais (Perguntas, Universidade, Redação, Troca de Conhecimento / Disputa e Desafio e Movimento), distribuídas por níveis (Alfabetização, Fundamental I, Fundamental II, Ensino Médio) e dificuldades (Fácil, Médio, Difícil)
- **Experiência Responsiva**:
  - **Desktop e Tablet (`>= 768px`)**: grade completa com todas as pilhas separadas por nível e dificuldade, cada card exibindo o ícone translúcido da casa ao fundo e sem eyebrows/subtítulos nos títulos principais.
  - **Mobile (`< 768px`)**: tela dedicada com header limpo (logo horizontal roxa + `CARTAS`) e 5 botões grandes no formato de pasta branca contendo 3 miniaturas em leque das cartas originais e o ícone central na cor exata da casa. Ao tocar em qualquer casa, o sorteio escolhe aleatoriamente uma carta entre todos os níveis e dificuldades disponíveis naquela casa.
- **Rotas da API (`server.ts`)**:
  - `GET /api/embed-simulator` — serve o HTML completo do simulador (`public/simulador.html`) sem `X-Frame-Options` e com CORS liberado para `<iframe>`.
  - `GET /api/simulator-meta` — retorna metadados do simulador (`sourceUrl`, `embedPath`, `staticPath`, `syncedAt`, `mode`, `byteLength`).

---

## 2. Estrutura de Arquivos e Artefatos do Repositório

```text
.
├── index.html                                                          # Entrada principal React/Vite
├── server.ts                                                           # Servidor Express + Vite middleware (dev) / dist (prod)
├── package.json                                                        # Scripts e dependências
├── metadata.json                                                       # Metadados do aplicativo
├── vite.config.ts                                                      # Configuração Vite + Tailwind v4
├── tsconfig.json                                                       # Configuração TypeScript
├── README.md                                                           # Documentação completa no GitHub
├── src/
│   ├── main.tsx                                                        # Bootstrap React
│   ├── index.css                                                       # Tailwind v4 + tokens tipográficos
│   ├── App.tsx                                                         # Header (Logo horizontal + CARTAS) e iframe do simulador
│   └── utils/
│       └── iframeCode.ts                                               # Gerador de index.html (URL publicada, local e srcdoc)
└── public/
    ├── simulador.html                                                  # Simulador completo (216 cartas, desktop/tablet + mobile)
    └── assets/
        ├── icons/                                                      # Ícones extraídos com fundo transparente
        │   ├── casa_pergunta.png                                       # Interrogação — Casa de Perguntas
        │   ├── casa_universidade.png                                   # Cubo mágico — Casa Universidade
        │   ├── casa_redacao.png                                        # Caderno e lápis — Casa de Redação
        │   └── casa_troca.png                                          # Setas + cérebro — Troca de Conhecimento / Desafio e Movimento
        └── aistudio/                                                   # Logotipos, miniaturas originais e artes de referência
            ├── LOGO_HORIZONTAL_CABECAO_0eff6b30.png                    # Logo horizontal roxa (612x792, exibir com rotate-90)
            ├── LOGO_HORIZONTAL_CABECAO_BRANCA_8ea4bcf1.png             # Logo horizontal branca (1650x1275)
            ├── LOGO_HORIZONTAL_CABECAO_SALMAO_0723a14b.png             # Logo horizontal salmão (792x612)
            ├── LOGO_ICON_758fc1db.png                                  # Símbolo/mascote roxo CABEÇÃO (591x558)
            ├── cartas_cabecao-Artboard-1-copy-3-copy_939c4177.jpg      # Miniatura frente — Matemática (DSP-10)
            ├── cartas_cabecao-Artboard-1-copy-2-copy-copy-2_6f7aa7e6.jpg               # Miniatura frente — Linguagens (UNI-A-01)
            ├── cartas_cabecao-Artboard-1-copy-2-copy-copy-2-copy_3d55afe1.jpg          # Miniatura frente — Linguagens (DSP-01)
            ├── cartas_cabecao-Artboard-1-copy-2-copy-copy-2-copy-copy_2cdd5528.jpg     # Miniatura frente — Redação (RED-ALF-01)
            ├── cartas_cabecao-Artboard-1-copy-copy_ec207e67.jpg                        # Miniatura verso — Universidade / Cubo
            ├── cartas_cabecao-Artboard-1-copy-copy-copy-copy_6a887557.jpg              # Miniatura verso — Redação / Caderno
            ├── cartas_cabecao-Artboard-1-copy-copy-copy_49f63c2f.jpg                   # Miniatura verso — Movimento / Troca
            ├── image_75ad72d6.png                                      # Arte original — cabeça Universidade
            ├── image_95ce69d9.png                                      # Arte original — cabeça Perguntas
            ├── image_c8ac51fe.png                                      # Arte original — cabeça Redação
            ├── image_6f1751cc.png                                      # Arte original — cabeça Troca / Movimento
            └── WhatsApp_Image_2026-11-26_at_00.42.18_64b3cc43.jpeg     # Wireframe de referência da tela mobile
```

---

## 3. Arquivo `index.html`

### 3.1 `index.html` da Raiz do Projeto (React + Vite)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cabeção — Simulador de Baralho &amp; Iframe</title>
    <meta name="description" content="Carrega automaticamente o simulador de baralho Cabeção a partir do Google Sites e gera o arquivo index.html pronto para integração via iframe." />
    <meta property="og:title" content="Cabeção — Simulador de Baralho &amp; Iframe" />
    <meta property="og:description" content="Carrega automaticamente o simulador de baralho Cabeção a partir do Google Sites e gera o arquivo index.html pronto para integração via iframe." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/png" href="/assets/aistudio/LOGO_ICON_758fc1db.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=JetBrains+Mono:wght@400;500&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-slate-100 text-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.2 `index.html` Estático via `<iframe>` (Ideal para GitHub Pages)

Coloque este `index.html` na mesma pasta de `simulador.html` e da pasta `assets/`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CABEÇÃO — Simulador de Baralho</title>
  <link rel="icon" type="image/png" href="./assets/aistudio/LOGO_ICON_758fc1db.png" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #f1f5f9;
    }
    .simulador-frame {
      display: block;
      width: 100%;
      height: 100dvh;
      border: 0;
    }
  </style>
</head>
<body>
  <iframe
    class="simulador-frame"
    src="./simulador.html"
    title="CABEÇÃO — Simulador de Baralho"
    loading="eager"
    allow="clipboard-write; fullscreen"
    allowfullscreen
  ></iframe>
</body>
</html>
```

### 3.3 `index.html` via `<iframe>` apontando para a URL Publicada

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CABEÇÃO — Simulador de Baralho</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #0e1633;
    }
    .simulador-frame {
      display: block;
      width: 100%;
      height: 100dvh;
      border: 0;
    }
  </style>
</head>
<body>
  <iframe
    class="simulador-frame"
    src="https://ais-pre-dex7its6zt2kwwysd7z2eo-83586360005.us-east1.run.app/api/embed-simulator"
    title="CABEÇÃO — Simulador de Baralho"
    loading="eager"
    allow="clipboard-write; fullscreen"
    allowfullscreen
  ></iframe>
</body>
</html>
```

---

## 4. Identidade Visual e Paleta de Cores

### 4.1 Cartas de Matérias

| Matéria | Cor | Código HEX | Cor do Texto |
| :--- | :--- | :--- | :--- |
| **Matemática** | Vermelho | `#E34D64` | `#FFFFFF` |
| **Natureza** | Verde | `#A5D39E` | `#0F172A` |
| **Linguagens** | Azul | `#008CC3` | `#FFFFFF` |
| **Humanas** | Amarelo | `#F3AE7A` | `#0F172A` |

### 4.2 Frente das Cartas e Casas

| Casa | Pilhas Incluídas | Cor | Código HEX | Texto sobre o Card |
| :--- | :--- | :--- | :--- | :--- |
| **Perguntas** | `ALF`, `F1F`, `F1M`, `F2F`, `F2M`, `F2D`, `EMF`, `EMM`, `EMD` | Roxo | `#723977` | `#FFFFFF` |
| **Redação** | `RED-ALF`, `RED-F1`, `RED-F2`, `RED-EM` | Vermelho-Rosé | `#E5616D` | `#FFFFFF` |
| **Universidade** | `UNI-A`, `UNI-M`, `UNI-D` | Azul Claro | `#ADDBDA` | `#FFFFFF` (mobile) / `#0F172A` (detalhes claros) |
| **Troca de Conhecimento (Disputa)** | `DSP` | Marrom | `#66403B` | `#FFFFFF` |
| **Desafio e Movimento** | `DES` | Azul Escuro | `#3D3F7B` | `#FFFFFF` |

### 4.3 Cores Estruturais e Superfícies

| Uso | Código HEX |
| :--- | :--- |
| **Navy Principal** | `#16224A` |
| **Navy Escuro** | `#0E1633` |
| **Fundo da Página (Canvas)** | `#F1F5F9` |
| **Superfície / Pastas Mobile / Cards** | `#FFFFFF` |
| **Texto Principal Escuro** | `#0F172A` |

### 4.4 Tokens CSS Prontos

```css
:root {
  /* Matérias */
  --materia-matematica: #E34D64;
  --materia-natureza: #A5D39E;
  --materia-linguagens: #008CC3;
  --materia-humanas: #F3AE7A;

  /* Casas / Frente das Cartas */
  --casa-perguntas: #723977;
  --casa-redacao: #E5616D;
  --casa-universidade: #ADDBDA;
  --casa-troca: #66403B;
  --casa-movimento: #3D3F7B;

  /* Estruturais */
  --brand-navy: #16224A;
  --brand-navy-dark: #0E1633;
  --surface-canvas: #F1F5F9;
  --surface-card: #FFFFFF;
  --ink-primary: #0F172A;
}
```

---

## 5. Fontes e Tipografia

| Papel | Família | Pesos | Aplicação |
| :--- | :--- | :--- | :--- |
| **Display / Títulos Principais** | `Bubblegum Sans` | `400` (Regular, sem faux-bold) | Títulos das seções (`Casa de Perguntas`, `Universidade`, `Redação`, `Troca de Conhecimento`, `Desafio e Movimento`), nomes dos níveis (`Alfabetização`, `Fundamental I/II`, `Ensino Médio`) e nomes das casas no mobile |
| **Corpo de Texto e Interface** | `Poppins` | `400`, `500`, `600`, `700`, `800`, `900` | Enunciados das cartas, alternativas, gabaritos, botões, subtítulos menores e texto `CARTAS` no header |
| **Códigos de Carta** | `JetBrains Mono` | `400`, `500` | Identificadores técnicos das cartas (`ALF-01`, `DSP-10`, `UNI-A-01`, `RED-ALF-01`) |

### Importação Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=JetBrains+Mono:wght@400;500&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
```

### Configuração Tailwind CSS v4 (`src/index.css`)

```css
@import "tailwindcss";

@theme {
  --font-display: "Bubblegum Sans", cursive, sans-serif;
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}
```

---

## 6. Logotipos, Ícones e Artefatos

### 6.1 Logotipos (`public/assets/aistudio/`)

| Arquivo | Dimensões | Uso e Observação Técnica |
| :--- | :--- | :--- |
| `LOGO_HORIZONTAL_CABECAO_0eff6b30.png` | `612 × 792 px` | Logo principal roxa usada no header superior claro e no cabeçalho mobile standalone. **Observação:** o arquivo PNG original está salvo em orientação vertical (90° anti-horário); no CSS é exibido horizontalmente com `transform: rotate(90deg)` dentro de um container com `overflow: hidden`. |
| `LOGO_HORIZONTAL_CABECAO_BRANCA_8ea4bcf1.png` | `1650 × 1275 px` | Logo horizontal branca usada sobre fundos escuros (cabeçalho desktop/tablet e tela de carregamento). |
| `LOGO_HORIZONTAL_CABECAO_SALMAO_0723a14b.png` | `792 × 612 px` | Logo horizontal salmão usada na faixa de Redação, modal de reembaralhar e áreas de destaque. |
| `LOGO_ICON_758fc1db.png` | `591 × 558 px` | Símbolo/mascote roxo usado no `favicon`, selos e modais. |

### 6.2 Ícones Recortados das Casas (`public/assets/icons/`)

Todos os ícones foram extraídos do interior das cabeças ilustradas com fundo transparente (PNG com canal alfa):

| Arquivo | Casa(s) | Cor de Aplicação | Uso |
| :--- | :--- | :--- | :--- |
| `casa_pergunta.png` | Casa de Perguntas | `#723977` | Marca d'água translúcida nos cards desktop/tablet e ícone central (via `mask-image`) na pasta branca mobile |
| `casa_universidade.png` | Universidade | `#ADDBDA` | Marca d'água translúcida nos cards desktop/tablet e ícone central na pasta branca mobile |
| `casa_redacao.png` | Redação | `#E5616D` | Marca d'água translúcida nos cards desktop/tablet e ícone central na pasta branca mobile |
| `casa_troca.png` | Troca de Conhecimento (`#66403B`) e Desafio e Movimento (`#3D3F7B`) | `#66403B` / `#3D3F7B` | Marca d'água translúcida nos cards desktop/tablet e ícone central na pasta branca mobile |

### 6.3 Miniaturas das Cartas Originais (`public/assets/aistudio/`)

Utilizadas em leque (3 miniaturas saindo do topo de cada pasta branca) na tela mobile:

- `cartas_cabecao-Artboard-1-copy-3-copy_939c4177.jpg` — Frente Matemática (`DSP-10`)
- `cartas_cabecao-Artboard-1-copy-2-copy-copy-2_6f7aa7e6.jpg` — Frente Linguagens (`UNI-A-01`)
- `cartas_cabecao-Artboard-1-copy-2-copy-copy-2-copy_3d55afe1.jpg` — Frente Linguagens (`DSP-01`)
- `cartas_cabecao-Artboard-1-copy-2-copy-copy-2-copy-copy_2cdd5528.jpg` — Frente Redação (`RED-ALF-01`)
- `cartas_cabecao-Artboard-1-copy-copy_ec207e67.jpg` — Verso marrom com cubo mágico
- `cartas_cabecao-Artboard-1-copy-copy-copy-copy_6a887557.jpg` — Verso salmão com caderno e lápis
- `cartas_cabecao-Artboard-1-copy-copy-copy_49f63c2f.jpg` — Verso azul escuro com setas e cérebro

---

## 7. Como Rodar e Publicar no GitHub

### 7.1 Execução Local (Node.js 22+)

```bash
npm install
npm run dev       # Inicia Express + Vite em http://localhost:3000
```

### 7.2 Build e Produção

```bash
npm run build     # Gera o bundle otimizado em dist/
npm start         # Inicia o servidor Express em produção (node server.ts)
```

### 7.3 Publicação Estática no GitHub Pages (Sem Servidor Node)

1. Copie o conteúdo da pasta `public/` (`simulador.html` e `assets/`) junto com o `index.html` estático da seção **3.2** para a raiz do branch de publicação (ou pasta `docs/`).
2. Caso o repositório seja publicado em um subcaminho (ex.: `https://seu-usuario.github.io/cabecao/`), substitua referências `/assets/` por `./assets/` em `simulador.html` para que logos, ícones e miniaturas carreguem relativamente ao subcaminho.
