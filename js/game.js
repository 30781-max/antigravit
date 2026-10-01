/**
 * ==============================================================================
 * CYBER PULSE — js/game.js
 * Gerenciador Principal do Jogo (Fluxo, Estados, Câmera e Renderização)
 * ==============================================================================
 * Integra todos os módulos: física, áudio, partículas, skins, níveis e colisões.
 * Gerencia o loop de animação do jogo a 60 FPS com delta-time estável.
 */

'use strict';

class GameManager {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Inicialização dos subsistemas
    this.audio = new AudioController();
    this.particles = new ParticleManager();
    this.skinManager = new SkinManager();
    this.player = new Player();

    // Controle de Fases e Estado
    this.currentLevelIndex = 0;
    this.level = LEVELS[this.currentLevelIndex];
    this.attempts = 1;
    this.totalAttempts = 0;
    this.gameState = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_COMPLETE', 'VICTORY'

    // Câmera e Efeitos Visuais
    this.cameraX = 0;
    this.screenShakeTime = 0;
    this.respawnTimer = 0;
    this.lastTime = performance.now();

    // Preview de Skin no Modal
    this.selectedSkinIdInModal = this.skinManager.currentSkinId;
    this.previewRotation = 0;
    this.previewCanvas = document.getElementById('skinPreviewCanvas');
    this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;

    // Carregar progresso salvo no localStorage
    this.unlockedLevel = parseInt(localStorage.getItem('cyberpulse_unlocked') || '1', 10);
    this.completedLevels = JSON.parse(localStorage.getItem('cyberpulse_completed') || '[]');
    this.attemptsHistory = JSON.parse(localStorage.getItem('cyberpulse_attempts') || '{}');
    this.bestPercentages = JSON.parse(localStorage.getItem('cyberpulse_bests') || '{}');
    this.savedCoins = JSON.parse(localStorage.getItem('cyberpulse_coins') || '{}');
    this.collectedCoinsThisRun = {};
    this.speedMultiplier = 1.0;
    this.beatPulse = 0;

    // Conectar batida rítmica da bateria chiptune com os visuais da cena
    this.audio.onBeat = (step) => {
      this.beatPulse = 1.0;
    };

    // Conectar eventos e interface
    this.bindDomElements();
    this.bindInputs();
    this.setupResize();
    this.renderLevelSelectGrid();
    this.renderSkinsGrid();
    this.updateAudioButtonState();


    // Iniciar loop principal de animação
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * Vincula todos os botões e elementos visuais do DOM
   */
  bindDomElements() {
    this.dom = {
      // Telas e Telas Sobrepostas
      hud: document.getElementById('gameHud'),
      mainMenu: document.getElementById('mainMenu'),
      levelSelectMenu: document.getElementById('levelSelectMenu'),
      skinsModal: document.getElementById('skinsModal'),
      howToPlayModal: document.getElementById('howToPlayModal'),
      pauseModal: document.getElementById('pauseModal'),
      levelCompleteModal: document.getElementById('levelCompleteModal'),
      gameVictoryModal: document.getElementById('gameVictoryModal'),
      deathFlash: document.getElementById('deathFlash'),

      // HUD Superior
      progressBarFill: document.getElementById('progressBarFill'),
      progressPercent: document.getElementById('progressPercent'),
      hudLevelBadge: document.getElementById('hudLevelBadge'),
      hudLevelName: document.getElementById('hudLevelName'),
      hudAttempts: document.getElementById('hudAttempts'),
      soundIcon: document.getElementById('soundIcon'),
      btnSoundToggle: document.getElementById('btnSoundToggle'),
      btnQuickRestart: document.getElementById('btnQuickRestart'),
      btnPause: document.getElementById('btnPause'),

      // Botões do Menu Principal
      btnPlay: document.getElementById('btnPlay'),
      btnLevelSelect: document.getElementById('btnLevelSelect'),
      btnSkins: document.getElementById('btnSkins'),
      btnHowToPlay: document.getElementById('btnHowToPlay'),

      // Seleção de Fases
      btnBackFromLevels: document.getElementById('btnBackFromLevels'),
      btnBackToMain: document.getElementById('btnBackToMain'),

      // Modal de Skins
      btnBackFromSkins: document.getElementById('btnBackFromSkins'),
      btnBackToMainFromSkins: document.getElementById('btnBackToMainFromSkins'),
      btnEquipSkin: document.getElementById('btnEquipSkin'),
      skinPreviewName: document.getElementById('skinPreviewName'),
      skinPreviewDesc: document.getElementById('skinPreviewDesc'),
      skinPreviewBadge: document.getElementById('skinPreviewBadge'),
      skinsGrid: document.getElementById('skinsGrid'),

      // Como Jogar
      btnCloseHowToPlay: document.getElementById('btnCloseHowToPlay'),
      btnStartFromHelp: document.getElementById('btnStartFromHelp'),

      // Pausa
      btnResume: document.getElementById('btnResume'),
      btnRestartFromPause: document.getElementById('btnRestartFromPause'),
      btnLevelsFromPause: document.getElementById('btnLevelsFromPause'),
      btnMenuFromPause: document.getElementById('btnMenuFromPause'),

      // Conclusão de Fase
      completeLevelTitle: document.getElementById('completeLevelTitle'),
      completeAttempts: document.getElementById('completeAttempts'),
      btnNextLevel: document.getElementById('btnNextLevel'),
      btnReplayLevel: document.getElementById('btnReplayLevel'),
      btnLevelsFromWin: document.getElementById('btnLevelsFromWin'),

      // Vitória Total
      totalAttemptsValue: document.getElementById('totalAttemptsValue'),
      btnPlayAgainAll: document.getElementById('btnPlayAgainAll'),
      btnLevelsFromAllWin: document.getElementById('btnLevelsFromAllWin')
    };

    // Ações do Menu Principal
    this.dom.btnPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.startLevel(this.currentLevelIndex);
    });

    this.dom.btnLevelSelect.addEventListener('click', () => {
      this.audio.playClick();
      this.openLevelSelect();
    });

    if (this.dom.btnSkins) {
      this.dom.btnSkins.addEventListener('click', () => {
        this.audio.playClick();
        this.openSkinsModal();
      });
    }

    this.dom.btnHowToPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.howToPlayModal.classList.add('active');
    });

    this.dom.btnCloseHowToPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.howToPlayModal.classList.remove('active');
    });

    this.dom.btnStartFromHelp.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.howToPlayModal.classList.remove('active');
      this.startLevel(this.currentLevelIndex);
    });

    // Fechar Fases
    this.dom.btnBackFromLevels.addEventListener('click', () => {
      this.audio.playClick();
      this.closeLevelSelect();
    });
    this.dom.btnBackToMain.addEventListener('click', () => {
      this.audio.playClick();
      this.closeLevelSelect();
    });

    // Fechar / Equipar Skins
    if (this.dom.btnBackFromSkins) {
      this.dom.btnBackFromSkins.addEventListener('click', () => {
        this.audio.playClick();
        this.closeSkinsModal();
      });
    }
    if (this.dom.btnBackToMainFromSkins) {
      this.dom.btnBackToMainFromSkins.addEventListener('click', () => {
        this.audio.playClick();
        this.closeSkinsModal();
      });
    }
    if (this.dom.btnEquipSkin) {
      this.dom.btnEquipSkin.addEventListener('click', () => {
        this.audio.playClick();
        this.equipSkin(this.selectedSkinIdInModal);
      });
    }

    // Botões do HUD
    this.dom.btnSoundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = this.audio.toggleMute();
      this.updateAudioButtonState();
      if (!muted && this.gameState === 'PLAYING') {
        this.audio.startMusic(this.level.speed / 400);
      }
    });

    this.dom.btnQuickRestart.addEventListener('click', (e) => {
      e.stopPropagation();
      this.restartLevel();
    });

    this.dom.btnPause.addEventListener('click', (e) => {
      e.stopPropagation();
      this.pauseGame();
    });

    // Menu de Pausa
    this.dom.btnResume.addEventListener('click', () => {
      this.audio.playClick();
      this.resumeGame();
    });
    this.dom.btnRestartFromPause.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.pauseModal.classList.remove('active');
      this.restartLevel();
    });
    this.dom.btnLevelsFromPause.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.pauseModal.classList.remove('active');
      this.openLevelSelect();
    });
    this.dom.btnMenuFromPause.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.pauseModal.classList.remove('active');
      this.returnToMenu();
    });

    // Conclusão de Fase
    this.dom.btnNextLevel.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.levelCompleteModal.classList.remove('active');
      if (this.currentLevelIndex < LEVELS.length - 1) {
        this.startLevel(this.currentLevelIndex + 1);
      } else {
        this.showGrandVictory();
      }
    });
    this.dom.btnReplayLevel.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.levelCompleteModal.classList.remove('active');
      this.startLevel(this.currentLevelIndex);
    });
    this.dom.btnLevelsFromWin.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.levelCompleteModal.classList.remove('active');
      this.openLevelSelect();
    });

    // Vitória Total
    this.dom.btnPlayAgainAll.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.gameVictoryModal.classList.remove('active');
      this.startLevel(0);
    });
    this.dom.btnLevelsFromAllWin.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.gameVictoryModal.classList.remove('active');
      this.openLevelSelect();
    });
  }

  /**
   * Controles do jogador: Teclado, Clique de Mouse e Toque em Mobile
   */
  bindInputs() {
    const handleJumpAction = () => {
      if (this.gameState === 'PLAYING') {
        const activeSkin = this.skinManager.getCurrentSkin();
        this.player.queueJump(this.level.jumpOrbs, this.audio, this.particles, activeSkin);
      }
    };


    // Teclado
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJumpAction();
      } else if (e.code === 'KeyR') {
        if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED') {
          this.restartLevel();
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.gameState === 'PLAYING') {
          this.pauseGame();
        } else if (this.gameState === 'PAUSED') {
          this.resumeGame();
        }
      }
    });

    // Clique com o Mouse no Canvas Principal
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        handleJumpAction();
      }
    });

    // Toque na Tela para Celulares e Tablets
    window.addEventListener('touchstart', (e) => {
      // Ignora toques em botões e modais da interface
      if (e.target.closest('.hud-btn') || e.target.closest('.cyber-btn') || e.target.closest('.close-btn') || e.target.closest('.skin-card')) {
        return;
      }
      e.preventDefault();
      handleJumpAction();
    }, { passive: false });
  }

  /**
   * Mantém a resolução do Canvas proporcional a 16:9 em qualquer tela
   */
  setupResize() {
    const resize = () => {
      const container = document.getElementById('gameContainer');
      const w = container.clientWidth;
      const h = container.clientHeight;

      const scale = Math.min(w / CONFIG.CANVAS_WIDTH, h / CONFIG.CANVAS_HEIGHT);
      this.canvas.style.width = `${Math.floor(CONFIG.CANVAS_WIDTH * scale)}px`;
      this.canvas.style.height = `${Math.floor(CONFIG.CANVAS_HEIGHT * scale)}px`;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  updateAudioButtonState() {
    this.dom.soundIcon.textContent = this.audio.isMuted ? '🔇' : '🔊';
  }

  /**
   * Renderiza a grade de seleção de fases
   */
  renderLevelSelectGrid() {
    const grid = document.getElementById('levelsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    LEVELS.forEach((lvl, idx) => {
      const isUnlocked = lvl.id <= this.unlockedLevel;
      const isCompleted = this.completedLevels.includes(lvl.id);
      const attemptsCount = this.attemptsHistory[lvl.id] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;

      const savedCoinsList = this.savedCoins[lvl.id] || [];
      const coinsHtml = [0, 1, 2].map(cIdx => 
        `<span class="card-coin ${savedCoinsList.includes(cIdx) ? 'collected' : ''}">★</span>`
      ).join('');
      const best = isCompleted ? 100 : (this.bestPercentages[lvl.id] || 0);

      card.innerHTML = `
        <div class="card-top">
          <span class="card-badge">FASE ${lvl.id}</span>
          <span class="card-difficulty ${lvl.difficultyClass}">${lvl.difficultyName}</span>
        </div>
        <div class="card-title">${lvl.name}</div>
        <div class="card-coins-row">${coinsHtml}</div>
        <div class="card-stats">
          <span>${isCompleted ? '⭐ Concluída' : (isUnlocked ? `Recorde: ${best}%` : '🔒 Bloqueada')}</span>
          <span>${attemptsCount > 0 ? `#${attemptsCount} tentativas` : ''}</span>
        </div>
        <div class="card-progress-bar">
          <div class="card-progress-fill" style="width: ${best}%"></div>
        </div>
      `;


      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.audio.playClick();
          this.closeLevelSelect();
          this.startLevel(idx);
        });
      }

      grid.appendChild(card);
    });
  }

  openLevelSelect() {
    this.renderLevelSelectGrid();
    this.dom.mainMenu.classList.remove('active');
    this.dom.levelSelectMenu.classList.add('active');
  }

  closeLevelSelect() {
    this.dom.levelSelectMenu.classList.remove('active');
    if (this.gameState === 'MENU') {
      this.dom.mainMenu.classList.add('active');
    }
  }

  /**
   * SISTEMA DE SKINS: Gerencia o Modal e Seleção de Aparência
   */
  openSkinsModal() {
    this.selectedSkinIdInModal = this.skinManager.currentSkinId;
    this.renderSkinsGrid();
    this.updateSkinPreviewDetails();

    this.dom.mainMenu.classList.remove('active');
    if (this.dom.skinsModal) {
      this.dom.skinsModal.classList.add('active');
    }
  }

  closeSkinsModal() {
    if (this.dom.skinsModal) {
      this.dom.skinsModal.classList.remove('active');
    }
    if (this.gameState === 'MENU') {
      this.dom.mainMenu.classList.add('active');
    }
  }

  equipSkin(skinId) {
    this.skinManager.equipSkin(skinId);
    this.renderSkinsGrid();
    this.updateSkinPreviewDetails();
  }

  renderSkinsGrid() {
    const grid = document.getElementById('skinsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const allSkins = this.skinManager.getAllSkins();
    allSkins.forEach((skin) => {
      const isEquipped = skin.id === this.skinManager.currentSkinId;
      const isSelected = skin.id === this.selectedSkinIdInModal;

      const card = document.createElement('div');
      card.className = `skin-card ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}`;

      card.innerHTML = `
        <div class="skin-card-icon" style="text-shadow: 0 0 10px ${skin.glowColor};">${skin.icon}</div>
        <div class="skin-card-name">${skin.name}</div>
        <div class="skin-card-tag">${skin.tag || 'CUSTOM'}</div>
        ${isEquipped ? '<div class="skin-card-badge">EM USO</div>' : ''}
      `;

      card.addEventListener('click', () => {
        this.audio.playClick();
        this.selectedSkinIdInModal = skin.id;
        this.renderSkinsGrid();
        this.updateSkinPreviewDetails();
      });

      grid.appendChild(card);
    });
  }

  updateSkinPreviewDetails() {
    const skin = this.skinManager.getSkinById(this.selectedSkinIdInModal);
    if (!skin) return;

    if (this.dom.skinPreviewName) this.dom.skinPreviewName.textContent = skin.name.toUpperCase();
    if (this.dom.skinPreviewDesc) this.dom.skinPreviewDesc.textContent = skin.desc;

    const isEquipped = skin.id === this.skinManager.currentSkinId;
    if (this.dom.skinPreviewBadge) {
      this.dom.skinPreviewBadge.textContent = isEquipped ? 'EQUIPADA' : 'CLIQUE EM EQUIPAR';
      this.dom.skinPreviewBadge.className = `skin-info-badge ${isEquipped ? 'badge-equipped' : 'badge-idle'}`;
    }

    if (this.dom.btnEquipSkin) {
      const btnText = this.dom.btnEquipSkin.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = isEquipped ? '✓ EQUIPADA' : 'EQUIPAR SKIN';
      }
      this.dom.btnEquipSkin.disabled = isEquipped;
    }
  }

  /**
   * Renderiza a animação do preview da skin no canvas do modal de skins
   */
  drawSkinPreview(dt) {
    if (!this.previewCanvas || !this.previewCtx) return;
    if (!this.dom.skinsModal || !this.dom.skinsModal.classList.contains('active')) return;

    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;
    const timeSec = performance.now() / 1000;

    ctx.clearRect(0, 0, w, h);

    // Fundo futurista escuro no preview
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 110);
    bgGrad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
    bgGrad.addColorStop(1, 'rgba(4, 6, 16, 0.9)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Borda do display de holograma
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Rotação contínua elegante do cubo no preview
    this.previewRotation += dt * 45; // 45 graus por segundo
    const skin = this.skinManager.getSkinById(this.selectedSkinIdInModal);

    // Efeito de levitação senoidal
    const floatY = Math.sin(timeSec * 3) * 6;

    this.skinManager.drawSkinOnCanvas(
      ctx,
      skin,
      w / 2,
      h / 2 + floatY,
      64, // Tamanho do cubo no preview
      this.previewRotation,
      timeSec
    );
  }

  returnToMenu() {
    this.gameState = 'MENU';
    this.audio.stopMusic();
    this.dom.hud.classList.remove('active');
    this.dom.hud.classList.add('hud-hidden');
    this.dom.mainMenu.classList.add('active');
  }

  /**
   * Inicia uma fase específica
   */
  startLevel(index) {
    this.currentLevelIndex = index;
    this.level = LEVELS[this.currentLevelIndex];
    this.attempts = 1;

    this.dom.mainMenu.classList.remove('active');
    this.dom.levelSelectMenu.classList.remove('active');
    if (this.dom.skinsModal) this.dom.skinsModal.classList.remove('active');
    this.dom.hud.classList.remove('hud-hidden');
    this.dom.hud.classList.add('active');

    this.updateHudInfo();
    this.resetPlayerToStart();
    this.gameState = 'PLAYING';
    this.audio.startMusic(this.level.speed / 400);
  }

  restartLevel() {
    this.attempts++;
    this.attemptsHistory[this.level.id] = (this.attemptsHistory[this.level.id] || 0) + 1;
    localStorage.setItem('cyberpulse_attempts', JSON.stringify(this.attemptsHistory));

    this.updateHudInfo();
    this.resetPlayerToStart();
    this.gameState = 'PLAYING';
    this.audio.startMusic(this.level.speed / 400);
  }

  resetPlayerToStart() {
    this.player.reset();
    this.cameraX = 0;
    this.particles.clear();
    this.respawnTimer = 0;
    this.speedMultiplier = 1.0;
    this.collectedCoinsThisRun = {};

    // Restaurar Jump Orbs
    if (this.level.jumpOrbs) {
      for (const orb of this.level.jumpOrbs) {
        orb.used = false;
      }
    }

    // Restaurar moedas na run
    if (this.level.secretCoins) {
      for (const coin of this.level.secretCoins) {
        coin.collected = false;
      }
    }

    // Restaurar Speed Portals
    if (this.level.speedPortals) {
      for (const portal of this.level.speedPortals) {
        portal.activated = false;
      }
    }

    this.updateCoinsHud();
  }



  pauseGame() {
    if (this.gameState !== 'PLAYING') return;
    this.gameState = 'PAUSED';
    this.audio.stopMusic();
    this.dom.pauseModal.classList.add('active');
  }

  resumeGame() {
    if (this.gameState !== 'PAUSED') return;
    this.gameState = 'PLAYING';
    this.dom.pauseModal.classList.remove('active');
    this.audio.startMusic(this.level.speed / 400);
  }

  killPlayer() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.screenShakeTime = 0.25;

    this.audio.playDeath();
    const activeSkin = this.skinManager.getCurrentSkin();
    this.particles.emitDeathExplosion(
      this.player.x,
      this.player.y,
      activeSkin ? activeSkin.primaryColor : this.level.colors.primary,
      activeSkin ? activeSkin.accentColor : '#ff0077'
    );

    // Efeito de flash na tela
    this.dom.deathFlash.classList.add('trigger');
    setTimeout(() => {
      this.dom.deathFlash.classList.remove('trigger');
    }, 120);

    // Reinicia após breve pausa de impacto
    this.respawnTimer = 0.38;
  }

  completeLevel() {
    this.gameState = 'LEVEL_COMPLETE';
    this.audio.stopMusic();
    this.audio.playVictory();
    this.particles.emitCelebration(this.cameraX);

    // Salvar progresso
    if (!this.completedLevels.includes(this.level.id)) {
      this.completedLevels.push(this.level.id);
      localStorage.setItem('cyberpulse_completed', JSON.stringify(this.completedLevels));
    }

    if (this.level.id >= this.unlockedLevel && this.unlockedLevel < LEVELS.length) {
      this.unlockedLevel = this.level.id + 1;
      localStorage.setItem('cyberpulse_unlocked', this.unlockedLevel);
    }

    this.dom.completeLevelTitle.textContent = `Fase ${this.level.id}: ${this.level.name}`;
    this.dom.completeAttempts.textContent = `#${this.attempts}`;

    const savedCoinsCount = (this.savedCoins[this.level.id] || []).length;
    const coinsEl = document.getElementById('completeCoins');
    if (coinsEl) {
      coinsEl.textContent = `${'★'.repeat(savedCoinsCount)}${'☆'.repeat(3 - savedCoinsCount)} (${savedCoinsCount}/3)`;
    }

    this.bestPercentages[this.level.id] = 100;
    localStorage.setItem('cyberpulse_bests', JSON.stringify(this.bestPercentages));
    this.renderLevelSelectGrid();

    const isLastLevel = this.currentLevelIndex === LEVELS.length - 1;
    this.dom.btnNextLevel.querySelector('.btn-text').textContent = isLastLevel ? 'VER VITÓRIA TOTAL 👑' : 'PRÓXIMA FASE ➔';

    this.dom.levelCompleteModal.classList.add('active');
  }


  showGrandVictory() {
    this.gameState = 'VICTORY';
    this.audio.stopMusic();
    this.audio.playVictory();

    let total = 0;
    for (const id in this.attemptsHistory) {
      total += this.attemptsHistory[id];
    }
    this.dom.totalAttemptsValue.textContent = Math.max(total, 10);
    this.dom.gameVictoryModal.classList.add('active');
  }

  updateHudInfo() {
    if (this.dom.hudLevelBadge) this.dom.hudLevelBadge.textContent = `FASE ${this.level.id}`;
    if (this.dom.hudLevelName) this.dom.hudLevelName.textContent = this.level.name;
    if (this.dom.hudAttempts) this.dom.hudAttempts.textContent = `#${this.attempts}`;
    if (this.dom.hudBestRecord) {
      const best = this.bestPercentages[this.level.id] || 0;
      this.dom.hudBestRecord.textContent = `REC: ${best}%`;
    }
  }


  /**
   * ATUALIZAÇÃO DO MUNDO FÍSICO
   */
  update(dt) {
    this.particles.update(dt);

    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    if (this.respawnTimer > 0) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.restartLevel();
      }
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    const activeSkin = this.skinManager.getCurrentSkin();

    // 1. Atualizar Jogador com velocidade dinâmica (speed portals)
    const effectiveSpeed = this.level.speed * (this.speedMultiplier || 1.0);
    this.player.update(dt, effectiveSpeed, this.audio, this.particles, this.level, activeSkin);

    // 2. Câmera segue o jogador suavemente
    const targetCamX = this.player.x - 220;
    this.cameraX += (targetCamX - this.cameraX) * 0.15;

    // 3. Atualizar Barra de Progresso e Gravar Melhor Recorde (%)
    const progress = Math.min(100, Math.max(0, Math.floor((this.player.x / this.level.finishX) * 100)));
    this.dom.progressBarFill.style.width = `${progress}%`;
    this.dom.progressPercent.textContent = `${progress}%`;

    if (progress > (this.bestPercentages[this.level.id] || 0)) {
      this.bestPercentages[this.level.id] = progress;
      localStorage.setItem('cyberpulse_bests', JSON.stringify(this.bestPercentages));
      if (this.dom.hudBestRecord) {
        this.dom.hudBestRecord.textContent = `REC: ${progress}%`;
      }
    }

    // 4. Checar Linha de Chegada
    if (this.player.x >= this.level.finishX) {
      this.completeLevel();
      return;
    }

    // 5. Portais de Gravidade Verticais (Do chão ao teto)
    if (this.level.gravityPortals) {
      for (const portal of this.level.gravityPortals) {
        const pw = portal.w || 52;
        const py = CONFIG.CEILING_Y;
        const ph = CONFIG.GROUND_Y - CONFIG.CEILING_Y;

        if (
          this.player.x + this.player.w > portal.x &&
          this.player.x < portal.x + pw &&
          this.player.y + this.player.h >= py - 20 &&
          this.player.y <= py + ph + 20
        ) {
          if (this.player.gravityDir !== portal.targetGravity) {
            this.player.setGravity(portal.targetGravity);
            this.audio.playPortal();
            const pColor = portal.targetGravity === -1 ? '#ff0077' : '#00f0ff';
            this.particles.emitPortalBurst(portal.x + pw / 2, this.player.y + this.player.h / 2, pColor);
            this.screenShakeTime = 0.15;
          }
        }
      }
    }

    // 5.1 Portais de Velocidade (Speed Portals)
    if (this.level.speedPortals && this.level.speedPortals.length > 0) {
      for (const portal of this.level.speedPortals) {
        if (CollisionEngine.checkPlayerSpeedPortal(this.player, portal)) {
          if (!portal.activated) {
            portal.activated = true;
            this.speedMultiplier = portal.speedMultiplier || 1.15;
            try {
              if (this.audio && typeof this.audio.playSpeedPortal === 'function') {
                this.audio.playSpeedPortal();
              }
              if (this.particles && typeof this.particles.emitSpeedBoost === 'function') {
                this.particles.emitSpeedBoost(portal.x, this.player.y + this.player.h / 2);
              }
              if (this.audio && typeof this.audio.startMusic === 'function') {
                this.audio.startMusic((this.level.speed * this.speedMultiplier) / 400);
              }
            } catch (err) {
              console.warn("Speed portal notice:", err);
            }
          }
        }
      }
    }


    // 5.2 Moedas Secretas Colecionáveis (3 por fase)
    if (this.level.secretCoins) {
      for (let i = 0; i < this.level.secretCoins.length; i++) {
        const coin = this.level.secretCoins[i];
        if (!coin.collected && CollisionEngine.checkPlayerCoin(this.player, coin)) {
          coin.collected = true;
          this.collectedCoinsThisRun[i] = true;

          if (!this.savedCoins[this.level.id]) {
            this.savedCoins[this.level.id] = [];
          }
          if (!this.savedCoins[this.level.id].includes(i)) {
            this.savedCoins[this.level.id].push(i);
            localStorage.setItem('cyberpulse_coins', JSON.stringify(this.savedCoins));
          }

          this.audio.playCoin();
          this.particles.emitCoinCollect(coin.x, coin.y);
          this.particles.emitFloatingText(coin.x, coin.y - 24, "★ MOEDA SECRETA! ★", "#ffea00");
          this.updateCoinsHud();
        }
      }
    }

    // 6. Trampolins Neon (Jump Pads)
    if (this.level.jumpPads) {
      for (const pad of this.level.jumpPads) {
        const pw = pad.w || 48;
        const ph = pad.h || 14;
        if (
          this.player.x + this.player.w > pad.x &&
          this.player.x < pad.x + pw &&
          this.player.y + this.player.h >= pad.y - 6 &&
          this.player.y <= pad.y + ph + 8
        ) {
          const force = pad.bounceForce || 960;
          this.player.vy = -force * this.player.gravityDir;
          this.player.grounded = false;
          this.player.coyoteTimer = 0;
          this.player.jumpBufferTimer = 0;
          this.audio.playJumpPad();
          this.particles.emitJumpDust(pad.x, pad.y, '#ffea00', this.player.gravityDir === -1);
        }
      }
    }


    // 7. Colisão com Plataformas (Suporte a Pouso e Condução Estável)
    let isCurrentlyOnPlatform = false;
    for (const plat of this.level.platforms) {
      if (plat.x + plat.w < this.cameraX - 40 || plat.x > this.cameraX + CONFIG.CANVAS_WIDTH + 40) continue;

      const col = CollisionEngine.handlePlayerPlatform(this.player, plat, dt);
      if (col) {
        if (col.type === 'crash') {
          this.killPlayer();
          return;
        } else if (col.type === 'land') {
          this.player.land(col.surfaceY, this.audio, this.particles, this.level.colors.primary, activeSkin);
          isCurrentlyOnPlatform = true;
          break;
        } else if (col.type === 'riding') {
          // Mantém o cubo firmemente apoiado no topo da plataforma para correr e pular suavemente
          if (this.player.gravityDir === 1) {
            this.player.y = col.surfaceY - this.player.h;
          } else {
            this.player.y = col.surfaceY;
          }
          this.player.vy = 0;
          this.player.grounded = true;
          this.player.coyoteTimer = CONFIG.COYOTE_TIME;
          isCurrentlyOnPlatform = true;
          break;
        }
      }
    }


    // 8. Colisão com o Chão Padrão ou Teto Padrão
    if (!isCurrentlyOnPlatform) {
      const inPit = CollisionEngine.isPlayerInPit(this.player, this.level.pits);

      if (this.player.gravityDir === 1) {
        // Gravidade Normal
        if (!inPit) {
          if (this.player.y + this.player.h >= CONFIG.GROUND_Y) {
            this.player.land(CONFIG.GROUND_Y, this.audio, this.particles, this.level.colors.primary, activeSkin);
          } else {
            this.player.grounded = false;
          }
        } else {
          this.player.grounded = false;
          if (this.player.y > CONFIG.CANVAS_HEIGHT + 50) {
            this.killPlayer();
            return;
          }
        }
      } else {
        // Gravidade Invertida (Teto)
        if (this.player.y <= CONFIG.CEILING_Y) {
          this.player.land(CONFIG.CEILING_Y, this.audio, this.particles, this.level.colors.primary, activeSkin);
        } else {
          this.player.grounded = false;
        }
      }
    }

    // 9. Colisão com Espinhos
    for (const spike of this.level.spikes) {
      if (spike.x + spike.w < this.cameraX || spike.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      if (CollisionEngine.checkPlayerSpike(this.player, spike)) {
        this.killPlayer();
        return;
      }
    }

    // 10. Obstáculos Móveis (Oscilam com seno do tempo)
    const timeSec = performance.now() / 1000;
    for (const hzd of this.level.movingHazards) {
      const curY = hzd.baseY + Math.sin(timeSec * hzd.speed) * hzd.amplitude;

      if (
        this.player.x + this.player.w - 4 > hzd.x &&
        this.player.x + 4 < hzd.x + hzd.w &&
        this.player.y + this.player.h - 4 > curY &&
        this.player.y + 4 < curY + hzd.h
      ) {
        this.killPlayer();
        return;
      }
    }
  }

  /**
   * RENDERIZAÇÃO NO CANVAS HTML5
   */
  draw() {
    const ctx = this.ctx;
    const colors = this.level.colors;
    const timeSec = performance.now() / 1000;

    ctx.save();

    // Tremor de tela ao morrer
    if (this.screenShakeTime > 0) {
      const shakeAmt = 8 * (this.screenShakeTime / 0.25);
      const shakeX = (Math.random() - 0.5) * shakeAmt;
      const shakeY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(shakeX, shakeY);
    }

    // Fundo com Gradiente da Fase
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    bgGrad.addColorStop(0, colors.bgGrad1);
    bgGrad.addColorStop(1, colors.bgGrad2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Grade Futurista no Fundo com Efeito Parallax
    this.drawParallaxGrid(ctx, colors);

    ctx.save();
    // Deslocar mundo pela câmera
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Dicas Visuais no Mundo
    this.drawWorldHints(ctx);

    // Plataformas Sólidas
    this.drawPlatforms(ctx, colors);

    // Chão e Teto
    this.drawFloorAndCeiling(ctx, colors);

    // Portais Gravitacionais
    // Portais Gravitacionais
    this.drawPortals(ctx);

    // Portais de Velocidade (Speed Portals)
    this.drawSpeedPortals(ctx);

    // Trampolins Neon
    this.drawJumpPads(ctx);

    // Jump Orbs (Orbes de Pulo Flutuantes)
    this.drawJumpOrbs(ctx);

    // 3 Moedas Secretas Colecionáveis
    this.drawSecretCoins(ctx);

    // Espinhos
    this.drawSpikes(ctx, colors);

    // Perigos Móveis
    this.drawMovingHazards(ctx);

    // Linha de Chegada
    this.drawFinishLine(ctx, colors);

    // Jogador desenhado com a Skin Ativa
    if (!this.player.isDead) {
      const activeSkin = this.skinManager.getCurrentSkin();
      this.player.draw(ctx, activeSkin, colors, timeSec);
    }

    // Partículas
    this.particles.draw(ctx);

    ctx.restore();
    ctx.restore();
  }

  drawParallaxGrid(ctx, colors) {
    ctx.save();
    // Brilho pulsante no tempo com a bateria/música
    const pulseAlpha = 0.08 + (this.beatPulse || 0) * 0.14;
    ctx.strokeStyle = colors.primary;
    ctx.globalAlpha = pulseAlpha;
    ctx.lineWidth = 1 + (this.beatPulse || 0) * 1.5;

    const gridSize = 60;

    const offsetX = -(this.cameraX * 0.3) % gridSize;

    for (let x = offsetX; x < CONFIG.CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawWorldHints(ctx) {
    if (!this.level.hints) return;
    ctx.save();
    ctx.font = '700 15px Orbitron, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'center';

    for (const h of this.level.hints) {
      if (h.x + 350 < this.cameraX || h.x - 350 > this.cameraX + CONFIG.CANVAS_WIDTH) continue;
      ctx.fillText(h.text, h.x, h.y);
    }
    ctx.restore();
  }

  drawFloorAndCeiling(ctx, colors) {
    ctx.save();

    const floorY = CONFIG.GROUND_Y;
    const floorH = CONFIG.CANVAS_HEIGHT - floorY;
    let curX = Math.max(0, this.cameraX - 100);
    const endX = this.cameraX + CONFIG.CANVAS_WIDTH + 100;

    const sortedPits = [...this.level.pits].sort((a, b) => a.startX - b.startX);

    while (curX < endX) {
      let nextPit = null;
      for (const p of sortedPits) {
        if (p.endX > curX) {
          nextPit = p;
          break;
        }
      }

      if (!nextPit || nextPit.startX >= endX) {
        this.renderFloorSegment(ctx, curX, endX - curX, floorY, floorH, colors);
        break;
      } else {
        if (nextPit.startX > curX) {
          this.renderFloorSegment(ctx, curX, nextPit.startX - curX, floorY, floorH, colors);
        }
        curX = nextPit.endX;
      }
    }

    // Teto para gravidade invertida
    const hasCeiling = (this.level.gravityPortals && this.level.gravityPortals.length > 0) ||
                       (this.level.spikes && this.level.spikes.some(s => s.inverted));
    if (hasCeiling) {
      ctx.fillStyle = colors.floorBody;
      ctx.fillRect(this.cameraX - 50, 0, CONFIG.CANVAS_WIDTH + 100, CONFIG.CEILING_Y);

      ctx.strokeStyle = colors.floorTop;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 14;
      ctx.shadowColor = colors.floorTop;

      ctx.beginPath();
      ctx.moveTo(this.cameraX - 50, CONFIG.CEILING_Y);
      ctx.lineTo(this.cameraX + CONFIG.CANVAS_WIDTH + 50, CONFIG.CEILING_Y);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderFloorSegment(ctx, x, w, y, h, colors) {
    if (w <= 0) return;

    ctx.fillStyle = colors.floorBody;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = colors.floorTop;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 16;
    ctx.shadowColor = colors.floorTop;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }

  drawPlatforms(ctx, colors) {
    ctx.save();
    for (const plat of this.level.platforms) {
      if (plat.x + plat.w < this.cameraX || plat.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const isBlock = plat.isBlock || (plat.w <= 60 && plat.h >= 35);

      if (isBlock) {
        // Bloco Sólido com Estilo Geométrico Neon (Geometry Dash)
        ctx.fillStyle = 'rgba(10, 14, 36, 0.96)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        // Borda neon principal
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 16;
        ctx.shadowColor = colors.primary;
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

        // Moldura interna geométrica estilo GD
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeRect(plat.x + 6, plat.y + 6, plat.w - 12, plat.h - 12);

        // Losango/Núcleo central
        const cx = plat.x + plat.w / 2;
        const cy = plat.y + plat.h / 2;
        const radius = Math.min(plat.w, plat.h) * 0.22;

        ctx.fillStyle = colors.primary;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx + radius, cy);
        ctx.lineTo(cx, cy + radius);
        ctx.lineTo(cx - radius, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);

        // Topo brilhante para indicar superfície sólida de aterrissagem
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y);
        ctx.lineTo(plat.x + plat.w, plat.y);
        ctx.stroke();
      } else {
        // Plataforma Suspensa Widescreen
        ctx.fillStyle = 'rgba(12, 17, 44, 0.95)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = colors.primary;
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

        // Linha de topo destacada
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y);
        ctx.lineTo(plat.x + plat.w, plat.y);
        ctx.stroke();

        // Detalhes de grade/suportes neon nas plataformas longas
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        for (let bx = plat.x + 40; bx < plat.x + plat.w; bx += 40) {
          ctx.beginPath();
          ctx.moveTo(bx, plat.y + 4);
          ctx.lineTo(bx, plat.y + plat.h - 4);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  drawSpikes(ctx, colors) {
    ctx.save();
    for (const spike of this.level.spikes) {
      if (spike.x + spike.w < this.cameraX || spike.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const sx = spike.x;
      const sw = spike.w;
      const sh = spike.h;
      const sy = spike.y !== undefined ? spike.y : (spike.inverted ? CONFIG.CEILING_Y : CONFIG.GROUND_Y - sh);

      ctx.beginPath();
      if (spike.inverted) {
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + sw, sy);
        ctx.lineTo(sx + sw / 2, sy + sh);
      } else {
        ctx.moveTo(sx, sy + sh);
        ctx.lineTo(sx + sw, sy + sh);
        ctx.lineTo(sx + sw / 2, sy);
      }
      ctx.closePath();

      const spikeGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
      spikeGrad.addColorStop(0, '#ff0055');
      spikeGrad.addColorStop(1, '#ffaa00');

      ctx.fillStyle = spikeGrad;
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#ff0055';
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMovingHazards(ctx) {
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const hzd of this.level.movingHazards) {
      const curY = hzd.baseY + Math.sin(timeSec * hzd.speed) * hzd.amplitude;
      if (hzd.x + hzd.w < this.cameraX || hzd.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hzd.x + hzd.w / 2, hzd.baseY - hzd.amplitude);
      ctx.lineTo(hzd.x + hzd.w / 2, hzd.baseY + hzd.amplitude + hzd.h);
      ctx.stroke();

      ctx.fillStyle = hzd.color || '#ff0055';
      ctx.shadowBlur = 18;
      ctx.shadowColor = hzd.color || '#ff0055';
      ctx.fillRect(hzd.x, curY, hzd.w, hzd.h);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(hzd.x, curY, hzd.w, hzd.h);
    }
    ctx.restore();
  }

  drawPortals(ctx) {
    if (!this.level.gravityPortals || this.level.gravityPortals.length === 0) return;
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const portal of this.level.gravityPortals) {
      const pw = portal.w || 52;
      if (portal.x + pw < this.cameraX - 60 || portal.x > this.cameraX + CONFIG.CANVAS_WIDTH + 60) continue;

      const isCeilingTarget = portal.targetGravity === -1;
      const portalColor = isCeilingTarget ? '#ff0077' : '#00f0ff';
      const glowBase = isCeilingTarget ? '255, 0, 119' : '0, 240, 255';
      const topY = CONFIG.CEILING_Y;
      const bottomY = CONFIG.GROUND_Y;
      const gateH = bottomY - topY;
      const centerX = portal.x + pw / 2;

      // Aura de Fundo
      const auraPulse = Math.sin(timeSec * 5) * 8;
      const auraGrad = ctx.createRadialGradient(
        centerX, topY + gateH / 2, 20,
        centerX, topY + gateH / 2, 160 + auraPulse
      );
      auraGrad.addColorStop(0, `rgba(${glowBase}, 0.28)`);
      auraGrad.addColorStop(0.5, `rgba(${glowBase}, 0.08)`);
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(centerX - 160, topY - 20, 320, gateH + 40);

      // Coluna Central de Plasma Dimensional
      const fieldGrad = ctx.createLinearGradient(portal.x, 0, portal.x + pw, 0);
      fieldGrad.addColorStop(0, `rgba(${glowBase}, 0.35)`);
      fieldGrad.addColorStop(0.25, `rgba(${glowBase}, 0.8)`);
      fieldGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      fieldGrad.addColorStop(0.75, `rgba(${glowBase}, 0.8)`);
      fieldGrad.addColorStop(1, `rgba(${glowBase}, 0.35)`);

      ctx.fillStyle = fieldGrad;
      ctx.shadowBlur = 24 + Math.sin(timeSec * 8) * 6;
      ctx.shadowColor = portalColor;
      ctx.fillRect(portal.x + 4, topY, pw - 8, gateH);

      // Trilhos de Laser Laterais
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(portal.x + 3, topY);
      ctx.lineTo(portal.x + 3, bottomY);
      ctx.moveTo(portal.x + pw - 3, topY);
      ctx.lineTo(portal.x + pw - 3, bottomY);
      ctx.stroke();

      // Chevrons Indicadores de Sentido
      const chevronCount = 7;
      const chevronSpacing = gateH / (chevronCount + 1);
      const flowOffset = (timeSec * 140 * (isCeilingTarget ? -1 : 1)) % chevronSpacing;

      ctx.font = '900 22px Orbitron, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffffff';

      const arrowSymbol = isCeilingTarget ? '▲' : '▼';
      for (let i = 0; i <= chevronCount + 1; i++) {
        let cy = topY + i * chevronSpacing + flowOffset;
        if (cy >= topY + 20 && cy <= bottomY - 20) {
          ctx.fillText(arrowSymbol, centerX, cy);
        }
      }

      // Braçadeiras Tecnológicas de Fixação no Teto e Chão
      ctx.fillStyle = '#080c20';
      ctx.strokeStyle = portalColor;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 16;
      ctx.shadowColor = portalColor;

      ctx.fillRect(portal.x - 8, topY - 14, pw + 16, 26);
      ctx.strokeRect(portal.x - 8, topY - 14, pw + 16, 26);

      ctx.fillRect(portal.x - 8, bottomY - 12, pw + 16, 26);
      ctx.strokeRect(portal.x - 8, bottomY - 12, pw + 16, 26);
    }
    ctx.restore();
  }

  drawJumpPads(ctx) {
    if (!this.level.jumpPads || this.level.jumpPads.length === 0) return;
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const pad of this.level.jumpPads) {
      const pw = pad.w || 48;
      const ph = pad.h || 14;
      if (pad.x + pw < this.cameraX || pad.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const padColor = '#ffea00';
      const pulse = Math.sin(timeSec * 8) * 3;

      ctx.fillStyle = '#141402';
      ctx.fillRect(pad.x, pad.y, pw, ph);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = padColor;
      ctx.shadowBlur = 18 + pulse;
      ctx.shadowColor = padColor;
      ctx.strokeRect(pad.x, pad.y, pw, ph);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pad.x + 6, pad.y + 3, pw - 12, ph - 6);

      ctx.fillStyle = '#ffea00';
      ctx.font = '900 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲', pad.x + pw / 2, pad.y - 7 + Math.sin(timeSec * 12) * 2.5);
    }
    ctx.restore();
  }

  /**
   * Renderiza os Jump Orbs (Orbes amarelos flutuantes com anéis orbitais)
   */
  drawJumpOrbs(ctx) {
    if (!this.level.jumpOrbs || this.level.jumpOrbs.length === 0) return;
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const orb of this.level.jumpOrbs) {
      if (orb.x + 50 < this.cameraX || orb.x - 50 > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const orbColor = orb.color || '#ffea00';
      const radius = orb.radius || CONFIG.ORB_RADIUS || 22;
      const pulse = Math.sin(timeSec * 7 + orb.x) * 3;
      const r = radius + pulse;

      // Se o orb foi usado nesta fase, fica com transparência reduzida
      if (orb.used) {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 1.0;
      }

      // Aura de Brilho Radial
      const auraGrad = ctx.createRadialGradient(orb.x, orb.y, radius * 0.3, orb.x, orb.y, r * 2.2);
      auraGrad.addColorStop(0, 'rgba(255, 234, 0, 0.45)');
      auraGrad.addColorStop(0.5, 'rgba(255, 200, 0, 0.15)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Anel Externo Pulsante
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = orbColor;
      ctx.shadowBlur = 18;
      ctx.shadowColor = orbColor;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Núcleo Central
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Círculo Interno Colorido
      ctx.fillStyle = orbColor;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Pontos Orbitais Giratórios
      const orbitCount = 3;
      const orbitDist = r + 5;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < orbitCount; i++) {
        const ang = timeSec * 4 + (i * (Math.PI * 2 / orbitCount));
        const ox = orb.x + Math.cos(ang) * orbitDist;
        const oy = orb.y + Math.sin(ang) * orbitDist;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Renderiza as 3 Moedas Secretas Colecionáveis com Rotação 3D Simulada
   */
  drawSecretCoins(ctx) {
    if (!this.level.secretCoins || this.level.secretCoins.length === 0) return;
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (let i = 0; i < this.level.secretCoins.length; i++) {
      const coin = this.level.secretCoins[i];
      if (coin.collected) continue; // Já coletada na run
      if (coin.x + 50 < this.cameraX || coin.x - 50 > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const size = coin.size || CONFIG.COIN_SIZE || 32;
      const scaleX = Math.cos(timeSec * 3.5 + i); // Efeito de moeda girando no eixo vertical
      const floatY = coin.y + Math.sin(timeSec * 4 + i) * 5;

      ctx.save();
      ctx.translate(coin.x, floatY);
      ctx.scale(Math.abs(scaleX), 1);

      // Brilho Dourado Intenso
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#ffd700';

      // Corpo da Moeda
      const coinGrad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
      coinGrad.addColorStop(0, '#fff480');
      coinGrad.addColorStop(0.5, '#ffd700');
      coinGrad.addColorStop(1, '#ff9900');
      ctx.fillStyle = coinGrad;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Borda Externa
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Anel Interno
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.34, 0, Math.PI * 2);
      ctx.stroke();

      // Estrela Central
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 1);

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Renderiza os Speed Portals (Portais de Aceleração com chevrons >>)
   */
  /**
   * Renderiza os Speed Portals (Portais de Velocidade Translúcidos Neon estilo Geometry Dash)
   */
  drawSpeedPortals(ctx) {
    if (!this.level.speedPortals || this.level.speedPortals.length === 0) return;
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const portal of this.level.speedPortals) {
      const pw = portal.w || 52;
      if (portal.x + pw < this.cameraX - 60 || portal.x > this.cameraX + CONFIG.CANVAS_WIDTH + 60) continue;

      const topY = CONFIG.CEILING_Y;
      const bottomY = CONFIG.GROUND_Y;
      const gateH = bottomY - topY;
      const centerX = portal.x + pw / 2;

      // Aura Holográfica Suave
      const auraGrad = ctx.createLinearGradient(portal.x - 20, 0, portal.x + pw + 20, 0);
      auraGrad.addColorStop(0, 'rgba(255, 140, 0, 0)');
      auraGrad.addColorStop(0.5, 'rgba(255, 170, 0, 0.22)');
      auraGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(portal.x - 20, topY, pw + 40, gateH);

      // Coluna Translúcida Interna
      const beamGrad = ctx.createLinearGradient(portal.x, 0, portal.x + pw, 0);
      beamGrad.addColorStop(0, 'rgba(255, 170, 0, 0.35)');
      beamGrad.addColorStop(0.5, 'rgba(255, 230, 100, 0.15)');
      beamGrad.addColorStop(1, 'rgba(255, 170, 0, 0.35)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(portal.x + 4, topY, pw - 8, gateH);

      // Linhas Laterais de Laser Neon
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffaa00';
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#ff8800';
      ctx.beginPath();
      ctx.moveTo(portal.x + 3, topY);
      ctx.lineTo(portal.x + 3, bottomY);
      ctx.moveTo(portal.x + pw - 3, topY);
      ctx.lineTo(portal.x + pw - 3, bottomY);
      ctx.stroke();

      // Chevrons Vetoriais Neon (>>) com animação de pulso rítmico
      const chevronSpacing = 65;
      const flowOffset = (timeSec * 80) % chevronSpacing;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffe600';

      for (let cy = topY + 30 + flowOffset; cy <= bottomY - 30; cy += chevronSpacing) {
        // Primeiro Chevron (>)
        ctx.beginPath();
        ctx.moveTo(centerX - 10, cy - 10);
        ctx.lineTo(centerX - 3, cy);
        ctx.lineTo(centerX - 10, cy + 10);
        ctx.stroke();

        // Segundo Chevron (>)
        ctx.beginPath();
        ctx.moveTo(centerX + 2, cy - 10);
        ctx.lineTo(centerX + 9, cy);
        ctx.lineTo(centerX + 2, cy + 10);
        ctx.stroke();
      }

      // Suportes Tecnológicos discretos no chão e teto
      ctx.fillStyle = '#140c02';
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffaa00';
      ctx.fillRect(portal.x - 4, topY - 10, pw + 8, 16);
      ctx.strokeRect(portal.x - 4, topY - 10, pw + 8, 16);

      ctx.fillRect(portal.x - 4, bottomY - 6, pw + 8, 16);
      ctx.strokeRect(portal.x - 4, bottomY - 6, pw + 8, 16);
    }
    ctx.restore();
  }


  /**
   * Atualiza a exibição das 3 Moedas Secretas no HUD
   */
  updateCoinsHud() {
    for (let i = 0; i < 3; i++) {
      const coinEl = document.getElementById(`hudCoin${i + 1}`);
      if (!coinEl) continue;

      const isCollectedRun = !!this.collectedCoinsThisRun[i];
      const isSaved = this.savedCoins[this.level.id] && this.savedCoins[this.level.id].includes(i);

      if (isCollectedRun || isSaved) {
        coinEl.classList.add('collected');
      } else {
        coinEl.classList.remove('collected');
      }
    }
  }

  drawFinishLine(ctx, colors) {
    const fx = this.level.finishX;
    if (fx + 40 < this.cameraX || fx > this.cameraX + CONFIG.CANVAS_WIDTH) return;

    ctx.save();
    const finishGrad = ctx.createLinearGradient(fx, 0, fx + 30, 0);
    finishGrad.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
    finishGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
    finishGrad.addColorStop(1, 'rgba(0, 255, 136, 0.2)');

    ctx.fillStyle = finishGrad;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff88';
    ctx.fillRect(fx, 0, 36, CONFIG.CANVAS_HEIGHT);

    ctx.font = '900 28px Orbitron, sans-serif';
    ctx.fillStyle = '#060a1e';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', fx + 18, CONFIG.CANVAS_HEIGHT / 2);

    ctx.restore();
  }

  /**
   * LOOP PRINCIPAL DE JOGO (60 FPS com delta-time suave)
   */
  gameLoop(currentTime) {
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Limita delta-time máximo para evitar saltos bruscos se o usuário trocar de aba
    if (dt > 0.05) dt = 0.05;

    // Decaimento do pulso de batida rítmica
    if (this.beatPulse > 0) {
      this.beatPulse = Math.max(0, this.beatPulse - dt * 3.5);
    }

    this.update(dt);
    this.draw();
    this.drawSkinPreview(dt);

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

