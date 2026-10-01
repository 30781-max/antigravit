/**
 * ==============================================================================
 * CYBER PULSE — js/particles.js
 * Sistema de Partículas Neon (Rastros, Poeira de Pulo, Explosões e Celebração)
 * ==============================================================================
 * Gerencia todas as partículas visuais do jogo. Cada skin pode emitir cores
 * e formatos exclusivos de rastro pelo cubo.
 */

'use strict';

class ParticleManager {
  constructor() {
    this.particles = [];
  }

  /**
   * Partículas do rastro neon deixado atrás do cubo
   */
  emitTrail(x, y, color, skinType = 'default') {
    if (Math.random() < 0.35) return;

    let pColor = color;
    let pSize = Math.random() * 5 + 3;
    let pLife = 0.28;
    let pType = 'square';

    if (skinType === 'matrix_hacker') {
      pColor = Math.random() > 0.4 ? '#00ff66' : '#a3ffb8';
      pType = 'glitch';
    } else if (skinType === 'solar_flare') {
      pColor = Math.random() > 0.5 ? '#ff4800' : '#ffcc00';
      pType = 'fire';
    } else if (skinType === 'void_phantom') {
      pColor = Math.random() > 0.4 ? '#bf00ff' : '#ff00aa';
      pType = 'star';
    } else if (skinType === 'crimson_tron') {
      pColor = Math.random() > 0.4 ? '#ff003c' : '#ff4444';
      pType = 'spark';
    } else if (skinType === 'vapor_sunset') {
      pColor = Math.random() > 0.5 ? '#ff2a85' : '#00f0ff';
      pType = 'square';
    } else if (skinType === 'gold_champion') {
      pColor = Math.random() > 0.4 ? '#ffd700' : '#ffffff';
      pType = 'star';
    } else if (skinType === 'rainbow_shifter') {
      const hue = (performance.now() * 0.4) % 360;
      pColor = `hsl(${hue}, 100%, 60%)`;
      pType = 'square';
    }

    this.particles.push({
      x: x + (Math.random() * 6 - 3),
      y: y + (Math.random() * 6 - 3),
      vx: -(Math.random() * 50 + 25),
      vy: (Math.random() * 30 - 15),
      size: pSize,
      alpha: 0.85,
      color: pColor,
      life: pLife,
      maxLife: pLife,
      type: pType
    });
  }

  /**
   * Poeira e faíscas ao pular ou aterrissar em plataformas/chão/teto
   */
  emitJumpDust(x, y, color, isCeiling = false) {
    const dirY = isCeiling ? -1 : 1;
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + Math.random() * CONFIG.PLAYER_SIZE,
        y: y + (isCeiling ? 0 : CONFIG.PLAYER_SIZE),
        vx: (Math.random() - 0.5) * 160,
        vy: dirY * (Math.random() * 80 + 30),
        size: Math.random() * 4 + 2,
        alpha: 0.9,
        color: color,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark'
      });
    }
  }

  /**
   * Explosão estilhaçada dramática ao bater em um obstáculo
   */
  emitDeathExplosion(x, y, color1, color2) {
    for (let i = 0; i < 42; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 420 + 90;
      this.particles.push({
        x: x + CONFIG.PLAYER_SIZE / 2,
        y: y + CONFIG.PLAYER_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        alpha: 1,
        color: Math.random() > 0.5 ? color1 : color2,
        life: Math.random() * 0.4 + 0.5,
        maxLife: 0.85,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 16,
        type: 'fragment'
      });
    }
  }

  /**
   * Explosão em anel ao cruzar o Portal de Gravidade
   */
  emitPortalBurst(x, y, color) {
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);
      const speed = Math.random() * 280 + 120;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        alpha: 1,
        color: color,
        life: 0.45,
        maxLife: 0.45,
        type: 'spark'
      });
    }
  }

  /**
   * Chuva de confetes coloridos neon ao vencer a fase
   */
  emitCelebration(cameraX) {
    const colors = ['#00f0ff', '#00ff88', '#ff0077', '#ffb700', '#9d00ff', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      this.particles.push({
        x: cameraX + Math.random() * CONFIG.CANVAS_WIDTH,
        y: Math.random() * 320,
        vx: (Math.random() - 0.5) * 220,
        vy: Math.random() * 220 + 100,
        size: Math.random() * 8 + 4,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.9,
        maxLife: 1.9,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 9,
        type: 'confetti'
      });
    }
  }

  /**
   * Atualiza a posição, vida e transparência de cada partícula
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.rotation !== undefined && p.vRot) {
        p.rotation += p.vRot * dt;
      }
    }
  }

  /**
   * Desenha todas as partículas na tela com brilho neon
   */
  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;

      if (p.type === 'fragment' || p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.type === 'star') {
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.restore();
    }
  }

  /**
   * Limpa todas as partículas (ao reiniciar a fase)
   */
  clear() {
    this.particles = [];
  }
}
