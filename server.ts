import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_URL =
  'https://sites.google.com/view/sorteadordecartascabeo/full-page-embed';
const CACHE_TTL_MS = 5 * 60 * 1000;
const PORT = Number(process.env.PORT || 3000);

interface CachedSimulator {
  html: string;
  syncedAt: string;
  fetchedAtMs: number;
  mode: 'custom' | 'live' | 'fallback';
}

let cachedSimulator: CachedSimulator | null = null;

function decodeHtmlAttribute(encoded: string): string {
  return encoded
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function readLocalSimulatorHtml(): string | null {
  const candidates = [
    path.join(__dirname, 'public', 'simulador.html'),
    path.join(__dirname, 'dist', 'simulador.html'),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }
  return null;
}

async function getSimulatorPayload(forceRefresh = false): Promise<CachedSimulator> {
  const now = Date.now();
  const localHtml = readLocalSimulatorHtml();
  if (localHtml) {
    cachedSimulator = {
      html: localHtml,
      syncedAt: new Date().toISOString(),
      fetchedAtMs: now,
      mode: 'custom',
    };
    return cachedSimulator;
  }

  if (
    !forceRefresh &&
    cachedSimulator &&
    now - cachedSimulator.fetchedAtMs < CACHE_TTL_MS
  ) {
    return cachedSimulator;
  }

  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; CabecaoDeckEmbedder/1.0; +https://sites.google.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao acessar Google Sites`);
  }

  const pageHtml = await response.text();
  const match = pageHtml.match(/data-code="([^"]+)"/);
  if (!match || !match[1]) {
    throw new Error('Bloco embutido data-code não encontrado na página.');
  }

  const extractedHtml = decodeHtmlAttribute(match[1]);
  if (!extractedHtml.includes('<html') && !extractedHtml.includes('<!DOCTYPE')) {
    throw new Error('Conteúdo extraído não parece um documento HTML válido.');
  }

  cachedSimulator = {
    html: extractedHtml,
    syncedAt: new Date().toISOString(),
    fetchedAtMs: now,
    mode: 'live',
  };
  return cachedSimulator;
}

async function startServer() {
  const app = express();

  app.get('/api/embed-simulator', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1';
      const payload = await getSimulatorPayload(forceRefresh);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache');
      res.removeHeader('X-Frame-Options');
      res.status(200).send(payload.html);
    } catch (error) {
      res.status(502).json({
        error: 'Não foi possível carregar o simulador de baralho.',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  app.get('/api/simulator-meta', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1';
      const includeHtml = req.query.includeHtml === '1';
      const payload = await getSimulatorPayload(forceRefresh);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json({
        sourceUrl: SOURCE_URL,
        embedPath: '/api/embed-simulator',
        staticPath: '/simulador.html',
        syncedAt: payload.syncedAt,
        mode: payload.mode,
        byteLength: Buffer.byteLength(payload.html, 'utf8'),
        ...(includeHtml ? {html: payload.html} : {}),
      });
    } catch (error) {
      res.status(502).json({
        error: 'Não foi possível obter os metadados do simulador.',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: {server: httpServer},
        ws: {server: httpServer},
        hmr: hmrDisabled ? false : {server: httpServer},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        setHeaders(res, filePath) {
          if (filePath.endsWith('simulador.html')) {
            res.setHeader('Access-Control-Allow-Origin', '*');
          }
        },
      }),
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
