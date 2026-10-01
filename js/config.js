/**
 * ==============================================================================
 * CYBER PULSE — js/config.js
 * Configurações Gerais e Constantes Físicas do Jogo (Inspirado em Geometry Dash)
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
    this.arcTo(x, y + x + w, y, r);
    this.closePath();
    return this;
  };
}

/**
 * Constantes globais de configuração do jogo
 */
const CONFIG = {
  // Dimensões nativas do Canvas (formato 16:9 widescreen)
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,

  // Altura das superfícies de contato
  GROUND_Y: 570,          // Altura onde fica a linha do chão normal
  CEILING_Y: 150,         // Altura onde fica a linha do teto (para gravidade invertida)

  // Propriedades do Jogador (Cubo Neon)
  PLAYER_SIZE: 38,        // Largura e altura do cubo (em pixels)

  // Física do Movimento
  GRAVITY: 2150,          // Aceleração da gravidade (pixels por segundo ao quadrado)
  JUMP_FORCE: 690,        // Impulso inicial ao pular (pixels por segundo para cima)
  MAX_FALL_SPEED: 1100,   // Velocidade terminal máxima de queda (evita atravessar chão)
  
  // Janelas de tolerância para jogabilidade justa e sem frustração
  COYOTE_TIME: 0.09,      // Permite pular 0.09s após sair de uma beirada/plataforma
  JUMP_BUFFER: 0.12,      // Salva o clique de pulo 0.12s antes de tocar o chão para pular na hora

  // Animação do Cubo
  ROTATION_SPEED: 460,    // Velocidade de giro no ar em graus por segundo

  // Mecânicas de Geometry Dash (Jump Orbs, Moedas e Portais)
  ORB_RADIUS: 20,         // Raio visual do orbe
  ORB_HIT_RADIUS: 65,     // Distância máxima do cubo para conseguir tocar e ativar o orbe
  ORB_JUMP_FORCE: 730,    // Impulso vertical concedido pelo Jump Orb amarelo
  COIN_SIZE: 32,          // Tamanho das moedas secretas colecionáveis
  
  // Efeitos de Sincronia e Batida da Música
  BEAT_PULSE_DURATION: 0.16
};
