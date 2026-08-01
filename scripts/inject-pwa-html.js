// Pós-processa o dist/index.html gerado pelo `expo export --platform web`
// pra adicionar suporte a "Adicionar à Tela de Início" (PWA), travar zoom
// e remover a barra de rolagem no mobile — sem depender de static rendering
// (que quebra porque o cliente Supabase acessa `window` no build).
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />'
);

const extraHead = `
  <meta name="theme-color" content="#14161C" />
  <meta name="description" content="Maré — um espaço calmo para registrar o que você sente." />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Maré" />
  <link rel="apple-touch-icon" href="/Mare/apple-touch-icon.png" />
  <meta name="mobile-web-app-capable" content="yes" />
  <link rel="manifest" href="/Mare/manifest.webmanifest" />
  <meta name="format-detection" content="telephone=no" />
  <style id="mare-app-shell">
    html, body {
      background-color: #14161C;
      overscroll-behavior: none;
      touch-action: pan-x pan-y;
    }
    * { -webkit-tap-highlight-color: transparent; }
    @media (hover: none) and (pointer: coarse) {
      ::-webkit-scrollbar { display: none; width: 0; height: 0; }
      * { scrollbar-width: none; }
    }
  </style>
</head>`;

html = html.replace('</head>', extraHead);

fs.writeFileSync(indexPath, html);
console.log('index.html: tags de PWA/zoom injetadas.');
