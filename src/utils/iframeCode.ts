export type EmbedMode = 'proxy' | 'local' | 'standalone';
export type LayoutMode = 'fullscreen' | 'container';

export interface IframeSnippetOptions {
  mode: EmbedMode;
  layout: LayoutMode;
  pageTitle: string;
  embedUrl: string;
  containerHeightPx: number;
  simulatorHtml?: string;
}

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeScriptJson(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function buildIframeIndexHtml(options: IframeSnippetOptions): string {
  const safeTitle = escapeHtmlText(
    options.pageTitle.trim() || 'CABEÇÃO — Simulador de Baralho',
  );
  const heightPx = Math.max(480, Math.min(2400, options.containerHeightPx || 820));
  const iframeSrc =
    options.mode === 'local'
      ? './simulador.html'
      : options.embedUrl.trim() || '/api/embed-simulator';

  const layoutStyles =
    options.layout === 'fullscreen'
      ? `    html, body {
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
    }`
      : `    body {
      margin: 0;
      padding: 24px;
      background-color: #f1f5f9;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .simulador-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background-color: #ffffff;
    }
    .simulador-frame {
      display: block;
      width: 100%;
      height: ${heightPx}px;
      border: 0;
    }`;

  if (options.mode === 'standalone') {
    const serializedHtml = options.simulatorHtml
      ? escapeScriptJson(options.simulatorHtml)
      : '"<!DOCTYPE html><html><body>Carregando simulador...</body></html>"';

    const bodyMarkup =
      options.layout === 'fullscreen'
        ? `  <iframe
    id="cabecao-simulador"
    class="simulador-frame"
    title="${safeTitle}"
    allow="clipboard-write; fullscreen"
    allowfullscreen
  ></iframe>`
        : `  <div class="simulador-wrapper">
    <iframe
      id="cabecao-simulador"
      class="simulador-frame"
      title="${safeTitle}"
      allow="clipboard-write; fullscreen"
      allowfullscreen
    ></iframe>
  </div>`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
${layoutStyles}
  </style>
</head>
<body>
${bodyMarkup}
  <script>
    const iframe = document.getElementById('cabecao-simulador');
    iframe.srcdoc = ${serializedHtml};
  </script>
</body>
</html>
`;
  }

  const safeSrc = escapeHtmlText(iframeSrc);
  const bodyMarkup =
    options.layout === 'fullscreen'
      ? `  <iframe
    class="simulador-frame"
    src="${safeSrc}"
    title="${safeTitle}"
    loading="eager"
    allow="clipboard-write; fullscreen"
    allowfullscreen
  ></iframe>`
      : `  <div class="simulador-wrapper">
    <iframe
      class="simulador-frame"
      src="${safeSrc}"
      title="${safeTitle}"
      loading="eager"
      allow="clipboard-write; fullscreen"
      allowfullscreen
    ></iframe>
  </div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
${layoutStyles}
  </style>
</head>
<body>
${bodyMarkup}
</body>
</html>
`;
}

export function triggerFileDownload(filename: string, content: string): void {
  const blob = new Blob([content], {type: 'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
