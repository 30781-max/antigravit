/**
 * ==============================================================================
 * CYBER PULSE — js/player.js
 * Classe do Jogador (Física Precisa, Rotação e Renderização da Skin)
 * ==============================================================================
 * Controla a movimentação automática, saltos, tolerância (Coyote & Jump Buffer),
 * gravidade normal (+1) e invertida (-1) e o desenho visual da Skin escolhida.
 */

'use strict';

class Player {
  constructor() {
    this.reset();
  }

  /**
   * Restaura os valores iniciais do cubo ao começar ou reiniciar uma fase
   */
  reset() {
    this.x = 100;
    this.y = CONFIG.GROUND_Y - CONFIG.PLAYER_SIZE;
    this.w = CONFIG.PLAYER_SIZE;
    this.h = CONFIG.PLAYER_SIZE;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
    this.gravityDir = 1;       // 1 = normal (chão), -1 = invertido (teto)
    this.rotation = 0;         // Ângulo em graus
    this.targetRotation = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isDead = false;
  }

  /**
   * Inverte a gravidade ao passar por um portal vertical
   */
  setGravity(dir) {
    if (this.gravityDir !== dir) {
      this.gravityDir = dir;
      this.vy = 0;
      this.grounded = false;
    }
  }

  /**
   * Atualização contínua de física por frame
   */
  update(dt, speed, audioCtrl, particleMgr, level, activeSkin) {
    if (this.isDead) return;

    // 1. Velocidade horizontal constante da fase
    this.vx = speed;
    this.x += this.vx * dt;

    // 2. Temporizadores de tolerância (Coyote Time e Jump Buffer)
    if (this.grounded) {
      this.coyoteTimer = CONFIG.COYOTE_TIME;
    } else {
      this.coyoteTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Se o jogador clicou para pular um pouco antes de alcançar um orb ou tocar o chão, executa agora
    if (this.jumpBufferTimer > 0) {
      if (level && this.tryActivateOrb(level.jumpOrbs, audioCtrl, particleMgr, activeSkin)) {
        this.jumpBufferTimer = 0;
      } else if (this.coyoteTimer > 0) {
        this.performJump(audioCtrl, particleMgr, activeSkin);
      }
    }


    // 3. Aplicação da Aceleração da Gravidade
    const effectiveGravity = CONFIG.GRAVITY * this.gravityDir;
    this.vy += effectiveGravity * dt;

    // Limitar velocidade terminal de queda para evitar atravessar o chão em baixos FPS
    if (Math.abs(this.vy) > CONFIG.MAX_FALL_SPEED) {
      this.vy = Math.sign(this.vy) * CONFIG.MAX_FALL_SPEED;
    }

    this.y += this.vy * dt;

    // 4. Rotação do cubo no ar
    if (!this.grounded) {
      this.rotation += CONFIG.ROTATION_SPEED * this.gravityDir * dt;
    } else {
      // Quando toca o chão/plataforma, encaixa para o múltiplo mais próximo de 90°
      const snapAngle = Math.round(this.rotation / 90) * 90;
      this.rotation += (snapAngle - this.rotation) * 0.35;
    }

    // 5. Emissão do rastro neon característico da Skin
    if (Math.random() < 0.65) {
      const skinType = activeSkin ? activeSkin.id : 'default';
      const trailColor = activeSkin ? (activeSkin.glowColor || activeSkin.primaryColor) : level.colors.primary;
      particleMgr.emitTrail(this.x, this.y + this.h / 2, trailColor, skinType);
    }
  }

  /**
   * Tenta ativar um Jump Orb no ar se o jogador estiver dentro do raio de alcance
   * @param {Array} orbs
   * @param {AudioController} audioCtrl
   * @param {ParticleManager} particleMgr
   * @param {Object} activeSkin
   * @returns {boolean}
   */
  tryActivateOrb(orbs, audioCtrl, particleMgr, activeSkin) {
    if (!orbs || orbs.length === 0) return false;

    const px = this.x + this.w / 2;
    const py = this.y + this.h / 2;
    const hitRadius = CONFIG.ORB_HIT_RADIUS || 65;
    const hitRadiusSq = hitRadius * hitRadius;

    for (const orb of orbs) {
      if (orb.used) continue;
      const dx = px - orb.x;
      const dy = py - orb.y;
      if (dx * dx + dy * dy <= hitRadiusSq) {
        // Ativação do Jump Orb com impulso aéreo no sentido oposto à gravidade
        const force = orb.jumpForce || CONFIG.ORB_JUMP_FORCE || 730;
        this.vy = -force * this.gravityDir;
        this.grounded = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        orb.used = true;

        if (audioCtrl) audioCtrl.playOrb();
        if (particleMgr) {
          particleMgr.emitOrbBurst(orb.x, orb.y, orb.color || '#ffea00');
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Registra a intenção de pulo no buffer ou aciona o Jump Orb imediatamente
   */
  queueJump(orbs, audioCtrl, particleMgr, activeSkin) {
    // 1. Tentar primeiro ativar um Jump Orb se estiver no ar próximo a um
    if (this.tryActivateOrb(orbs, audioCtrl, particleMgr, activeSkin)) {
      return;
    }

    // 2. Se estiver no chão, pula imediatamente
    if (this.grounded || this.coyoteTimer > 0) {
      this.performJump(audioCtrl, particleMgr, activeSkin);
      return;
    }

    // 3. Caso contrário, guarda a intenção no buffer para pular assim que pousar ou alcançar um orb
    this.jumpBufferTimer = CONFIG.JUMP_BUFFER;
  }

  /**
   * Executa o impulso de salto
   */
  performJump(audioCtrl, particleMgr, activeSkin) {
    this.vy = -CONFIG.JUMP_FORCE * this.gravityDir;
    this.grounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    audioCtrl.playJump();
    const dustColor = activeSkin ? activeSkin.primaryColor : '#ffffff';
    particleMgr.emitJumpDust(this.x, this.y, dustColor, this.gravityDir === -1);
  }

  /**
   * Aterrissa suavemente sobre o chão ou plataforma
   */
  land(groundY, audioCtrl, particleMgr, color, activeSkin) {
    if (!this.grounded && Math.abs(this.vy) > 120) {
      audioCtrl.playLand();
      const landColor = activeSkin ? activeSkin.glowColor : color;
      particleMgr.emitJumpDust(this.x, this.y, landColor, this.gravityDir === -1);
    }

    this.grounded = true;
    this.vy = 0;

    if (this.gravityDir === 1) {
      this.y = groundY - this.h;
    } else {
      this.y = groundY;
    }
  }


  /**
   * Desenha o cubo do jogador utilizando a Skin selecionada
   */
  draw(ctx, activeSkin, levelColors, timeSec = 0) {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);

    const size = this.w;

    if (activeSkin) {
      let prim = activeSkin.primaryColor;
      let acc = activeSkin.accentColor;
      let glow = activeSkin.glowColor;

      // Suporte à skin dinâmica Rainbow RGB
      if (activeSkin.isDynamic) {
        const hue = (timeSec * 160) % 360;
        prim = `hsl(${hue}, 100%, 55%)`;
        acc = `hsl(${(hue + 60) % 360}, 100%, 50%)`;
        glow = prim;
      }

      // Efeito de brilho neon externo
      ctx.shadowBlur = 18;
      ctx.shadowColor = glow;

      // Corpo com gradiente da Skin
      const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
      grad.addColorStop(0, prim);
      grad.addColorStop(1, acc);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, 6);
      ctx.fill();

      // Borda neon brilhante
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = activeSkin.borderColor || '#ffffff';
      ctx.stroke();

      // Desenhar o rosto ou núcleo personalizado da Skin
      if (activeSkin.drawFace) {
        activeSkin.drawFace(ctx, size, timeSec);
      }
    } else {
      // Fallback para as cores da fase caso a skin não esteja carregada
      ctx.shadowBlur = 18;
      ctx.shadowColor = levelColors.primary;

      const grad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
      grad.addColorStop(0, levelColors.primary);
      grad.addColorStop(1, levelColors.accent);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, 6);
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    ctx.restore();
  }
}
