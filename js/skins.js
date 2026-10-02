/**
 * ==============================================================================
 * CYBER PULSE — js/skins.js
 * Catálogo e Sistema de Skins para o Cubo do Jogador
 * ==============================================================================
 * Permite ao jogador escolher entre diversas aparências temáticas para o seu cubo,
 * com efeitos de brilho neon, núcleos tecnológicos e rastros exclusivos.
 * Salva a skin escolhida no localStorage para persistir entre sessões.
 */

'use strict';

const SKINS = [
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    tag: 'PADRÃO',
    desc: 'O cubo clássico pulsando energia pura com visor holográfico.',
    icon: '⚡',
    primaryColor: '#00f0ff',
    accentColor: '#0066ff',
    glowColor: '#00f0ff',
    borderColor: '#ffffff',
    eyeBg: '#050a20',
    eyeColor: '#00f0ff',
    drawFace: (ctx, size) => {
      // Visor digital retangular com pupila luminosa
      ctx.fillStyle = '#050a20';
      ctx.beginPath();
      ctx.roundRect(-size * 0.28, -size * 0.28, size * 0.56, size * 0.56, 3);
      ctx.fill();

      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(-size * 0.12, -size * 0.12, size * 0.24, size * 0.24);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-size * 0.05, -size * 0.05, size * 0.1, size * 0.1);
    }
  },

  {
    id: 'matrix_hacker',
    name: 'Matrix Hacker',
    tag: 'TERMINAL',
    desc: 'Injetado com linhas de código verde fosforescente e núcleo digital.',
    icon: '💻',
    primaryColor: '#00ff66',
    accentColor: '#004411',
    glowColor: '#00ff66',
    borderColor: '#a3ffb8',
    eyeBg: '#021808',
    eyeColor: '#00ff66',
    drawFace: (ctx, size) => {
      // Monitor hacker com dados binários
      ctx.fillStyle = '#021808';
      ctx.beginPath();
      ctx.roundRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6, 2);
      ctx.fill();

      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);

      // Linhas de código no visor
      ctx.fillStyle = '#00ff66';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00ff66';
      ctx.fillRect(-size * 0.22, -size * 0.18, size * 0.44, 2.5);
      ctx.fillRect(-size * 0.22, -size * 0.04, size * 0.32, 2.5);
      ctx.fillRect(-size * 0.22, size * 0.1, size * 0.4, 2.5);
    }
  },

  {
    id: 'solar_flare',
    name: 'Solar Flare',
    tag: 'MAGMA',
    desc: 'Alimentado pela fúria de uma estrela solar com núcleo vulcânico.',
    icon: '🔥',
    primaryColor: '#ff4400',
    accentColor: '#ffaa00',
    glowColor: '#ff5500',
    borderColor: '#fff176',
    eyeBg: '#210500',
    eyeColor: '#ffdd00',
    drawFace: (ctx, size) => {
      // Núcleo de reator estelar circular
      ctx.fillStyle = '#210500';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Anel de plasma quente
      ctx.strokeStyle = '#ff3700';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      // Núcleo incandescente
      ctx.fillStyle = '#ffea00';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffaa00';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  {
    id: 'void_phantom',
    name: 'Void Phantom',
    tag: 'CÓSMICO',
    desc: 'Nascido nas profundezas do vácuo cósmico com energia dimensional.',
    icon: '🔮',
    primaryColor: '#9d00ff',
    accentColor: '#e100ff',
    glowColor: '#be29ec',
    borderColor: '#f3b8ff',
    eyeBg: '#15002b',
    eyeColor: '#ff00d4',
    drawFace: (ctx, size) => {
      // Olho cósmico em forma de diamante estelar
      ctx.fillStyle = '#15002b';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.32);
      ctx.lineTo(size * 0.32, 0);
      ctx.lineTo(0, size * 0.32);
      ctx.lineTo(-size * 0.32, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e100ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pupila do vácuo
      ctx.fillStyle = '#ff00d4';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00d4';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  {
    id: 'crimson_tron',
    name: 'Crimson Tron',
    tag: 'LASER',
    desc: 'Linhas vermelhas hiper-afiadas inspiradas em circuitos de alta velocidade.',
    icon: '🩸',
    primaryColor: '#ff0044',
    accentColor: '#77001a',
    glowColor: '#ff0044',
    borderColor: '#ff99aa',
    eyeBg: '#1a0006',
    eyeColor: '#ff0033',
    drawFace: (ctx, size) => {
      // Circuito angular em cruz laser
      ctx.fillStyle = '#1a0006';
      ctx.beginPath();
      ctx.roundRect(-size * 0.28, -size * 0.28, size * 0.56, size * 0.56, 3);
      ctx.fill();

      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0044';

      ctx.beginPath();
      ctx.moveTo(-size * 0.22, 0);
      ctx.lineTo(size * 0.22, 0);
      ctx.moveTo(0, -size * 0.22);
      ctx.lineTo(0, size * 0.22);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-size * 0.08, -size * 0.08, size * 0.16, size * 0.16);
    }
  },

  {
    id: 'vapor_sunset',
    name: 'Vaporwave Sunset',
    tag: 'RETRO 80s',
    desc: 'Estética neon retrô anos 80 com degradê rosa choque e ciano.',
    icon: '🌸',
    primaryColor: '#ff2a85',
    accentColor: '#00f0ff',
    glowColor: '#ff2a85',
    borderColor: '#ffffff',
    eyeBg: '#1f0022',
    eyeColor: '#00f0ff',
    drawFace: (ctx, size) => {
      // Óculos escuros cibernéticos ou sol poente
      ctx.fillStyle = '#180026';
      ctx.beginPath();
      ctx.roundRect(-size * 0.32, -size * 0.18, size * 0.64, size * 0.36, 4);
      ctx.fill();

      // Lentes espelhadas ciano/magenta
      const lensGrad = ctx.createLinearGradient(-size * 0.3, -size * 0.15, size * 0.3, size * 0.15);
      lensGrad.addColorStop(0, '#ff2a85');
      lensGrad.addColorStop(1, '#00f0ff');

      ctx.fillStyle = lensGrad;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(-size * 0.26, -size * 0.12, size * 0.52, size * 0.24);

      // Faixa branca de reflexo estilosa
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(-size * 0.2, -size * 0.08, size * 0.4, 2);
    }
  },

  {
    id: 'gold_champion',
    name: 'Golden Champion',
    tag: 'ELITE',
    desc: 'Forjado em ouro digital 24K para verdadeiros mestres do ritmo.',
    icon: '👑',
    primaryColor: '#ffd700',
    accentColor: '#b8860b',
    glowColor: '#ffe033',
    borderColor: '#fff7a0',
    eyeBg: '#211800',
    eyeColor: '#ffffff',
    drawFace: (ctx, size) => {
      // Brasão / Diamante Real Central
      ctx.fillStyle = '#241a00';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Estrela/Coroa cintilante
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.2);
      ctx.lineTo(size * 0.08, -size * 0.04);
      ctx.lineTo(size * 0.2, 0);
      ctx.lineTo(size * 0.08, size * 0.04);
      ctx.lineTo(0, size * 0.2);
      ctx.lineTo(-size * 0.08, size * 0.04);
      ctx.lineTo(-size * 0.2, 0);
      ctx.lineTo(-size * 0.08, -size * 0.04);
      ctx.closePath();
      ctx.fill();
    }
  },

  {
    id: 'rainbow_shifter',
    name: 'Rainbow Overdrive',
    tag: 'RGB DINÂMICO',
    desc: 'Iluminação RGB cromática dinâmica com transição fluida de cores.',
    icon: '🌈',
    primaryColor: '#ff0055',
    accentColor: '#00f0ff',
    glowColor: '#00ff88',
    borderColor: '#ffffff',
    eyeBg: '#080814',
    eyeColor: '#ffffff',
    isDynamic: true,
    drawFace: (ctx, size, timeSec = 0) => {
      const hue = (timeSec * 160) % 360;
      const dynamicColor = `hsl(${hue}, 100%, 65%)`;

      ctx.fillStyle = '#080814';
      ctx.beginPath();
      ctx.roundRect(-size * 0.28, -size * 0.28, size * 0.56, size * 0.56, 4);
      ctx.fill();

      ctx.strokeStyle = dynamicColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = dynamicColor;
      ctx.strokeRect(-size * 0.28, -size * 0.28, size * 0.56, size * 0.56);

      // Núcleo RGB giratório
      ctx.save();
      ctx.rotate(timeSec * 3);
      ctx.fillStyle = dynamicColor;
      ctx.fillRect(-size * 0.12, -size * 0.12, size * 0.24, size * 0.24);
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }
];

class SkinManager {
  constructor() {
    this.currentSkinId = localStorage.getItem('cyberpulse_skin') || 'cyber_neon';
    // Validação caso id salvo seja inválido
    if (!SKINS.some(s => s.id === this.currentSkinId)) {
      this.currentSkinId = 'cyber_neon';
    }
  }

  getAllSkins() {
    return SKINS;
  }

  getCurrentSkin() {
    return SKINS.find(s => s.id === this.currentSkinId) || SKINS[0];
  }

  getSkinById(id) {
    return SKINS.find(s => s.id === id) || SKINS[0];
  }

  equipSkin(id) {
    if (SKINS.some(s => s.id === id)) {
      this.currentSkinId = id;
      localStorage.setItem('cyberpulse_skin', id);
      return true;
    }
    return false;
  }

  /**
   * Renderiza a prévia de qualquer skin em um contexto de canvas 2D
   */
  drawSkinOnCanvas(ctx, skin, x, y, size, rotationDeg = 0, timeSec = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotationDeg * Math.PI) / 180);

    let prim = skin.primaryColor;
    let acc = skin.accentColor;
    let glow = skin.glowColor;

    if (skin.isDynamic) {
      const hue = (timeSec * 160) % 360;
      prim = `hsl(${hue}, 100%, 55%)`;
      acc = `hsl(${(hue + 60) % 360}, 100%, 50%)`;
      glow = prim;
    }

    // Brilho externo neon
    ctx.shadowBlur = 18;
    ctx.shadowColor = glow;

    // Corpo do cubo com gradiente
    const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    grad.addColorStop(0, prim);
    grad.addColorStop(1, acc);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, 6);
    ctx.fill();

    // Borda clara
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = skin.borderColor || '#ffffff';
    ctx.stroke();

    // Rosto/Detalhes customizados da skin
    if (skin.drawFace) {
      skin.drawFace(ctx, size, timeSec);
    }

    ctx.restore();
  }
}
