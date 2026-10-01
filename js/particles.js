/**
 * ==============================================================================
 * CYBER PULSE — js/particles.js
 * Sistema de Partículas Neon e Efeitos Visuais (Geometry Dash Style)
 * ==============================================================================
 * Gerencia shockwaves de orbes, faíscas de moedas, rastros do cubo,
 * textos flutuantes de feedback e explosões.
 */

'use strict';

class ParticleManager {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
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
   * Anel de Choque Expansivo (Shockwave) ao ativar um Jump Orb
   */
  emitOrbBurst(x, y, color = '#ffe600') {
    // 1. Shockwave circular em expansão
    this.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: CONFIG.ORB_RADIUS,
      maxSize: CONFIG.ORB_RADIUS * 3.5,
      alpha: 1,
      color: color,
      life: 0.25,
      maxLife: 0.25,
      type: 'shockwave'
    });

    // 2. Faíscas radiais
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const speed = Math.random() * 180 + 100;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        alpha: 1,
        color: color,
        life: 0.32,
        maxLife: 0.32,
        type: 'spark'
      });
    }
  }

  /**
   * Explosão cintilante ao coletar uma Moeda Secreta (Secret Coin)
   */
  emitCoinCollect(x, y) {
    // Estrelas e faíscas douradas
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 240 + 80;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        alpha: 1,
        color: Math.random() > 0.3 ? '#ffd700' : '#ffffff',
        life: 0.55,
        maxLife: 0.55,
        type: 'star'
      });
    }

    // Texto flutuante de conquista
    this.emitFloatingText(x, y - 15, '★ MOEDA SECRETA! ★', '#ffd700');
  }

  /**
   * Adiciona um texto flutuante estilizado neon que sobe e desaparece
   */
  emitFloatingText(x, y, text, color = '#00f0ff') {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      vy: -60,
      alpha: 1,
      life: 0.85,
      maxLife: 0.85
    });
  }

  /**
   * Explosão estilhaçada dramática ao bater em um obstáculo
   */
  emitDeathExplosion(x, y, color1, color2) {
    for (let i = 0; i < 44; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 450 + 90;
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
    for (let i = 0; i < 75; i++) {
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
   * Explosão de ativação do Jump Orb com shockwave expansiva
   */
  emitOrbBurst(x, y, color = '#ffea00') {
    // 1. Shockwave circular expansiva
    this.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 15,
      maxSize: 68,
      alpha: 1,
      color: color,
      life: 0.28,
      maxLife: 0.28,
      type: 'shockwave'
    });

    // 2. Anel de partículas radiais luminosas
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      const speed = Math.random() * 240 + 120;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        alpha: 1,
        color: Math.random() > 0.3 ? color : '#ffffff',
        life: 0.38,
        maxLife: 0.38,
        type: 'spark'
      });
    }
  }

  /**
   * Coleta de Moeda Secreta (Chuva de estrelas e brilhos dourados)
   */
  emitCoinCollect(x, y) {
    // Shockwave dourada
    this.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 12,
      maxSize: 60,
      alpha: 1,
      color: '#ffd700',
      life: 0.32,
      maxLife: 0.32,
      type: 'shockwave'
    });

    // Estrelas e faíscas douradas
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 280 + 80;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 4,
        alpha: 1,
        color: Math.random() > 0.4 ? '#ffd700' : '#ffffff',
        life: 0.55,
        maxLife: 0.55,
        type: 'star'
      });
    }
  }

  /**
   * Efeito de aceleração do Speed Portal (Linhas de rastro hipersônico)
   */
  emitSpeedBoost(x, y) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 60,
        vx: Math.random() * 400 + 200,
        vy: (Math.random() - 0.5) * 80,
        size: Math.random() * 6 + 2,
        alpha: 1,
        color: Math.random() > 0.5 ? '#ff7700' : '#ffea00',
        life: 0.35,
        maxLife: 0.35,
        type: 'spark'
      });
    }
  }

  /**
   * Adiciona um texto flutuante de feedback no mundo ("★ MOEDA SECRETA! ★")
   */
  emitFloatingText(x, y, text, color = '#ffea00') {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      vy: -55,
      life: 1.1,
      maxLife: 1.1,
      alpha: 1
    });
  }

  /**
   * Atualiza a física de todas as partículas e textos flutuantes
   */
  update(dt) {

    // 1. Atualizar Partículas
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

      if (p.type === 'shockwave') {
        const progress = 1 - (p.life / p.maxLife);
        p.currentRadius = p.size + (p.maxSize - p.size) * progress;
      }

      if (p.rotation !== undefined && p.vRot) {
        p.rotation += p.vRot * dt;
      }
    }

    // 2. Atualizar Textos Flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
      t.alpha = Math.max(0, t.life / t.maxLife);
    }
  }

  /**
   * Renderiza todas as partículas na tela com brilho neon
   */
  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentRadius || p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
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
      }

      ctx.restore();
    }

    // Desenhar Textos Flutuantes
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = '900 16px Orbitron, sans-serif';
      ctx.fillStyle = t.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = t.color;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  /**
   * Limpa todas as partículas (ao reiniciar a fase)
   */
  clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}
