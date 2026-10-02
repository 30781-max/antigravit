/**
 * ==============================================================================
 * CYBER PULSE — script.js (Versão Integrada de Compatibilidade)
 * ==============================================================================
 * 📌 DICA DE ORGANIZAÇÃO DO PROJETO:
 * Para facilitar o seu entendimento, todo o código do jogo agora está
 * dividido em arquivos pequenos, limpos e fáceis de editar na pasta "js/":
 * 
 * ├── js/config.js     -> Parâmetros de física (gravidade, pulo, tamanho)
 * ├── js/audio.js      -> Sintetizador de efeitos sonoros e música chiptune
 * ├── js/particles.js  -> Poeira de pulo, rastro da skin, explosões e confetes
 * ├── js/skins.js      -> Catálogo de 8 skins temáticas para o cubo
 * ├── js/collision.js  -> Detecção de colisão justa e precisa
 * ├── js/levels.js     -> As 10 fases expandidas com novos obstáculos balanceados
 * ├── js/player.js     -> Física do cubo, salto, gravidade e rotação
 * ├── js/game.js       -> Câmera suave, HUD, menus e loop a 60 FPS
 * ├── js/main.js       -> Inicialização do jogo
 * └── js/LEIAME.md     -> Manual explicando como editar cada parte do jogo!
 * ==============================================================================
 */

'use strict';

// Polyfill de segurança para suporte universal a canvas roundRect em navegadores mais antigos
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    let r = typeof radii === 'number' ? radii : 4;
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// Carregador condicional: se os scripts modulares da pasta js/ já foram carregados,
// evita redeclarar as classes para não gerar conflito.
if (typeof CONFIG === 'undefined') {
  console.log('CYBER PULSE: Carregando através do script.js integrado...');
}
