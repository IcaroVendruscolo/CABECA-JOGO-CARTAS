import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  buildIframeIndexHtml,
  triggerFileDownload,
  type EmbedMode,
  type LayoutMode,
} from './utils/iframeCode';

const GOOGLE_SITES_URL =
  'https://sites.google.com/view/sorteadordecartascabeo/full-page-embed';

const LOGO_PURPLE = '/assets/aistudio/LOGO_HORIZONTAL_CABECAO_0eff6b30.png';
const LOGO_WHITE =
  '/assets/aistudio/LOGO_HORIZONTAL_CABECAO_BRANCA_8ea4bcf1.png';
const LOGO_SALMON =
  '/assets/aistudio/LOGO_HORIZONTAL_CABECAO_SALMAO_0723a14b.png';
const LOGO_ICON = '/assets/aistudio/LOGO_ICON_758fc1db.png';

type ActiveTab = 'simulator' | 'code';

interface SimulatorMeta {
  sourceUrl: string;
  embedPath: string;
  staticPath: string;
  syncedAt: string;
  mode: 'custom' | 'live' | 'fallback';
  byteLength: number;
  html?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);

  const [meta, setMeta] = useState<SimulatorMeta | null>(null);
  const [simulatorHtml, setSimulatorHtml] = useState<string>('');

  const [embedMode, setEmbedMode] = useState<EmbedMode>('proxy');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('fullscreen');
  const [pageTitle, setPageTitle] = useState('CABEÇÃO — Simulador de Baralho');
  const [customEmbedUrl, setCustomEmbedUrl] = useState('');
  const [containerHeightPx, setContainerHeightPx] = useState(820);
  const [copied, setCopied] = useState(false);

  const simulatorShellRef = useRef<HTMLDivElement | null>(null);

  const defaultEmbedUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '/api/embed-simulator';
    }
    return `${window.location.origin}/api/embed-simulator`;
  }, []);

  const effectiveEmbedUrl = customEmbedUrl.trim() || defaultEmbedUrl;

  const fetchSimulatorMeta = useCallback(async (forceRefresh = false) => {
    try {
      const query = forceRefresh
        ? '?refresh=1&includeHtml=1'
        : '?includeHtml=1';
      const response = await fetch(`/api/simulator-meta${query}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao sincronizar com o servidor.`);
      }
      const data: SimulatorMeta = await response.json();
      setMeta(data);
      if (data.html) {
        setSimulatorHtml(data.html);
      }
      setIframeError(null);
    } catch (error) {
      setIframeError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o simulador.',
      );
    }
  }, []);

  useEffect(() => {
    fetchSimulatorMeta(false);
  }, [fetchSimulatorMeta]);

  const generatedIndexHtml = useMemo(() => {
    return buildIframeIndexHtml({
      mode: embedMode,
      layout: layoutMode,
      pageTitle,
      embedUrl: effectiveEmbedUrl,
      containerHeightPx,
      simulatorHtml,
    });
  }, [
    embedMode,
    layoutMode,
    pageTitle,
    effectiveEmbedUrl,
    containerHeightPx,
    simulatorHtml,
  ]);

  const previewSnippet = useMemo(() => {
    if (embedMode !== 'standalone') {
      return generatedIndexHtml;
    }
    const sizeKb = simulatorHtml
      ? (new TextEncoder().encode(simulatorHtml).length / 1024).toFixed(1)
      : '0.0';
    return buildIframeIndexHtml({
      mode: 'standalone',
      layout: layoutMode,
      pageTitle,
      embedUrl: effectiveEmbedUrl,
      containerHeightPx,
      simulatorHtml: `<!-- HTML completo do simulador CABEÇÃO (${sizeKb} KB) incluído automaticamente ao copiar ou baixar -->`,
    });
  }, [
    embedMode,
    generatedIndexHtml,
    simulatorHtml,
    layoutMode,
    pageTitle,
    effectiveEmbedUrl,
    containerHeightPx,
  ]);

  const iframeSrc =
    reloadNonce === 0
      ? '/api/embed-simulator?embedded=app'
      : `/api/embed-simulator?embedded=app&refresh=1&v=${reloadNonce}`;

  const handleReload = () => {
    setIframeLoaded(false);
    setIframeError(null);
    setReloadNonce((prev) => prev + 1);
    fetchSimulatorMeta(true);
    if (activeTab !== 'simulator') {
      setActiveTab('simulator');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedIndexHtml);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = generatedIndexHtml;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownloadIndexHtml = () => {
    triggerFileDownload('index.html', generatedIndexHtml);
  };

  const handleDownloadSimulatorHtml = () => {
    if (!simulatorHtml) return;
    triggerFileDownload('simulador.html', simulatorHtml);
  };

  const formattedSyncTime = meta?.syncedAt
    ? new Date(meta.syncedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const formattedSizeKb = meta?.byteLength
    ? `${(meta.byteLength / 1024).toFixed(1)} KB`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 h-[60px] bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
        <a
          href="#simulador"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('simulator');
          }}
          aria-label="CABEÇÃO"
          className="relative w-[112px] h-[46px] overflow-hidden flex items-center justify-center shrink-0"
        >
          <img
            src={LOGO_PURPLE}
            alt="CABEÇÃO"
            referrerPolicy="no-referrer"
            className="w-[78px] max-w-none h-auto rotate-90 select-none"
          />
        </a>

        <div className="flex items-center gap-2 text-[#16224A] shrink-0">
          <svg
            className="w-7 h-7 text-[#723977] shrink-0"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="7"
              width="12"
              height="16"
              rx="2.5"
              transform="rotate(-10 4 7)"
              fill="#FFFFFF"
            />
            <rect
              x="12"
              y="5"
              width="12"
              height="16"
              rx="2.5"
              transform="rotate(8 12 5)"
              fill="#FFFFFF"
            />
          </svg>
          <span className="font-display font-normal text-2xl tracking-wide text-[#16224A] whitespace-nowrap">
            CARTAS
          </span>
        </div>
      </header>

      {/* Live Simulator Viewport (kept mounted so drawn cards & state persist when viewing code) */}
      <main
        ref={simulatorShellRef}
        id="simulador"
        className={`relative flex-1 bg-[#0E1633] ${
          activeTab === 'simulator' ? 'block' : 'hidden'
        }`}
      >
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0E1633] text-slate-100 px-6 text-center">
            <div className="h-[72px] overflow-hidden flex items-center justify-center mb-3">
              <img
                src={LOGO_WHITE}
                alt="CABEÇÃO"
                referrerPolicy="no-referrer"
                className="h-[112px] w-auto max-w-none object-contain"
              />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4" />
            <p className="font-display font-normal text-xl sm:text-2xl tracking-wide text-white">
              Carregando simulador de baralho
            </p>
          </div>
        )}

        {iframeError && !iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 text-slate-900 px-6 text-center">
            <img
              src={LOGO_ICON}
              alt="Símbolo CABEÇÃO"
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain mb-3"
            />
            <p className="font-display font-normal text-2xl tracking-wide text-slate-900">
              Falha ao carregar o simulador
            </p>
            <p className="mt-2 max-w-md text-sm text-slate-600">{iframeError}</p>
            <button
              type="button"
              onClick={handleReload}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16224A] hover:bg-[#0E1633] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Tentar novamente</span>
            </button>
          </div>
        )}

        <iframe
          key={reloadNonce}
          src={iframeSrc}
          title="CABEÇÃO — Sorteador de Cartas e Simulador de Baralho"
          onLoad={() => setIframeLoaded(true)}
          onError={() =>
            setIframeError(
              'O navegador não conseguiu carregar o conteúdo do simulador.',
            )
          }
          allow="clipboard-write; fullscreen"
          allowFullScreen
          className="block w-full h-[calc(100dvh-60px)] border-0 bg-slate-100"
        />
      </main>

      {/* Iframe Integration Code Workspace */}
      {activeTab === 'code' && (
        <section className="flex-1 bg-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-[46px] overflow-hidden flex items-center shrink-0">
                  <img
                    src={LOGO_SALMON}
                    alt="CABEÇÃO"
                    referrerPolicy="no-referrer"
                    className="h-[72px] w-auto max-w-none object-contain"
                  />
                </div>
                <h1 className="font-display font-normal text-2xl sm:text-4xl tracking-wide text-slate-900 text-balance">
                  Integração via iframe (index.html)
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                <span>
                  Origem:{' '}
                  {meta?.mode === 'custom'
                    ? 'Simulador personalizado'
                    : meta?.mode === 'fallback'
                      ? 'Cópia local'
                      : 'Google Sites sincronizado'}
                </span>
                {formattedSizeKb && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{formattedSizeKb}</span>
                  </>
                )}
                {formattedSyncTime && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Atualizado às {formattedSyncTime}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <a
                  href={GOOGLE_SITES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#16224A] font-medium hover:underline"
                >
                  <span>Abrir site original</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Configuration Column */}
              <div className="lg:col-span-4 space-y-6 bg-white border border-slate-200 rounded-xl p-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Modo de integração
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEmbedMode('proxy')}
                      className={`px-3 py-2 text-left text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        embedMode === 'proxy'
                          ? 'bg-white text-[#16224A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      URL ao vivo deste servidor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmbedMode('local')}
                      className={`px-3 py-2 text-left text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        embedMode === 'local'
                          ? 'bg-white text-[#16224A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Arquivo local (./simulador.html)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmbedMode('standalone')}
                      className={`px-3 py-2 text-left text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        embedMode === 'standalone'
                          ? 'bg-white text-[#16224A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Arquivo único autocontido (srcdoc)
                    </button>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {embedMode === 'proxy' &&
                      'Mantém o index.html enxuto e carrega o simulador sempre sincronizado a partir do endpoint /api/embed-simulator.'}
                    {embedMode === 'local' &&
                      'Ideal para hospedar em qualquer servidor estático. Baixe tanto o index.html quanto o simulador.html na mesma pasta.'}
                    {embedMode === 'standalone' &&
                      'Embute todo o código do simulador dentro do próprio index.html usando iframe srcdoc. Funciona até offline sem servidor.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Formato do iframe
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('fullscreen')}
                      className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        layoutMode === 'fullscreen'
                          ? 'bg-white text-[#16224A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tela cheia (100dvh)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('container')}
                      className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        layoutMode === 'container'
                          ? 'bg-white text-[#16224A] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Container embutido
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-5 border-t border-slate-200">
                  <div>
                    <label
                      htmlFor="page-title-input"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Título da página
                    </label>
                    <input
                      id="page-title-input"
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#6B3FA0]"
                    />
                  </div>

                  {embedMode === 'proxy' && (
                    <div>
                      <label
                        htmlFor="embed-url-input"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        URL do src do iframe
                      </label>
                      <input
                        id="embed-url-input"
                        type="url"
                        value={customEmbedUrl}
                        placeholder={defaultEmbedUrl}
                        onChange={(e) => setCustomEmbedUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#6B3FA0]"
                      />
                    </div>
                  )}

                  {layoutMode === 'container' && (
                    <div>
                      <label
                        htmlFor="container-height-input"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Altura do iframe (px)
                      </label>
                      <input
                        id="container-height-input"
                        type="number"
                        min={480}
                        max={2400}
                        step={20}
                        value={containerHeightPx}
                        onChange={(e) =>
                          setContainerHeightPx(Number(e.target.value) || 820)
                        }
                        className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#6B3FA0]"
                      />
                    </div>
                  )}
                </div>

                {embedMode === 'local' && (
                  <div className="pt-5 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleDownloadSimulatorHtml}
                      disabled={!simulatorHtml}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#16224A] bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      <span>Baixar simulador.html</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Code Preview Column */}
              <div className="lg:col-span-8 bg-[#0E1633] text-slate-100 rounded-xl overflow-hidden border border-slate-800">
                <div className="px-5 py-3.5 bg-[#16224A] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Code2 className="w-4 h-4 text-slate-300" aria-hidden="true" />
                    <span className="font-mono">index.html</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copiar código</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadIndexHtml}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E1633] bg-white hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Baixar arquivo</span>
                    </button>
                  </div>
                </div>

                <pre className="p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-200 max-h-[560px]">
                  <code>{previewSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
