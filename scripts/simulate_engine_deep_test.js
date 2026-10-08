/**
 * Simulação e Teste Profundo do Motor de Física e Colisões
 */
const fs = require('fs');
const path = require('path');

// Carregar CONFIG, CollisionEngine e Player no escopo global
const configCode = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');
const collisionCode = fs.readFileSync(path.join(__dirname, '../js/collision.js'), 'utf8');
const playerCode = fs.readFileSync(path.join(__dirname, '../js/player.js'), 'utf8');

eval(configCode.replace('const CONFIG =', 'global.CONFIG ='));
eval(collisionCode.replace('class CollisionEngine', 'global.CollisionEngine = class CollisionEngine'));
eval(playerCode.replace('class Player', 'global.Player = class Player'));

console.log("==================================================================");
console.log("TESTE DO MOTOR DE COLISÕES E FÍSICA DO JOGADOR");
console.log("==================================================================");

let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

// ---------------------------------------------------------------------------
// TESTE 1: Colisão de Espinhos (Eliminação de Falsos Positivos)
// ---------------------------------------------------------------------------
console.log("\n--- TESTE 1: Colisão Precisa de Espinhos ---");
const player = new Player();
const spike = { x: 500, w: 36, h: 38 }; // sy = 570 - 38 = 532. Apex em (518, 532). Base em (500, 570) a (536, 570)

// 1.1 Longe do espinho
player.x = 400; player.y = 532;
assert(!CollisionEngine.checkPlayerSpike(player, spike), "Jogador longe do espinho não colide");

// 1.2 Colisão frontal real no chão
player.x = 490; player.y = 532; // x+w = 528, sobrepõe base
assert(CollisionEngine.checkPlayerSpike(player, spike), "Jogador tocando na base do espinho colide");

// 1.3 Pulo alto sobre o espinho (acima da ponta)
player.x = 500; player.y = 450; // py + ph = 488 < 532
assert(!CollisionEngine.checkPlayerSpike(player, spike), "Jogador pulando bem acima do espinho não colide");

// 1.4 Pulo rasante com o canto do jogador na área vazia da AABB do espinho (FALSO POSITIVO ANTIGO!)
// Bounding box do espinho é [500, 536] x [532, 570].
// No antigo motor, qualquer ponto dentro desse retângulo retornava true!
// Aqui o ápice é em x: 518, y: 532. Em y: 540, a largura do triângulo é de apenas +/- 3.8px (514.2 a 521.8).
// Colocamos o jogador em x: 470 (x+w = 508), y: 504 (y+ph = 542).
// O canto inferior direito do jogador está em (508, 542), que está DENTRO da AABB [500..536 x 532..570],
// mas BEM FORA do triângulo (508 < 513).
player.x = 470; player.y = 504;
assert(!CollisionEngine.checkPlayerSpike(player, spike), "Pulo rasante em diagonal na AABB vazia NÃO causa falso positivo!");


// ---------------------------------------------------------------------------
// TESTE 2: Plataformas e Blocos (Pouso, Condução e Crash)
// ---------------------------------------------------------------------------
console.log("\n--- TESTE 2: Plataformas (Pouso Seguro, Condução e Parede) ---");
const plat = { x: 600, y: 515, w: 200, h: 22, isBlock: false };

// 2.1 Pouso de cima para baixo
player.x = 620;
player.prevY = 515 - player.h - 12; // estava acima
player.y = 515 - player.h + 4;       // tocou a superfície
player.vy = 200;                    // caindo
const landResult = CollisionEngine.handlePlayerPlatform(player, plat, 0.016);
assert(landResult && landResult.type === 'land' && landResult.surfaceY === 515, "Pouso de cima para baixo detectado como 'land'");

// 2.2 Condução estável (andando em cima)
player.x = 650;
player.prevY = 515 - player.h;
player.y = 515 - player.h;
player.vy = 0;
const rideResult = CollisionEngine.handlePlayerPlatform(player, plat, 0.016);
assert(rideResult && rideResult.type === 'riding' && rideResult.surfaceY === 515, "Correndo em cima detectado como 'riding'");

// 2.3 Batida frontal na parede de um bloco
const tallBlock = { x: 800, y: 528, w: 45, h: 42, isBlock: true };
player.x = 770; // x+w = 808 (penetrou 8px na parede)
player.prevY = 532; // estava no chão normal, abaixo do topo
player.y = 532;
player.vy = 0;
const crashResult = CollisionEngine.handlePlayerPlatform(player, tallBlock, 0.016);
assert(crashResult && crashResult.type === 'crash', "Batida frontal na parede do bloco detectada como 'crash'");


// ---------------------------------------------------------------------------
// TESTE 3: Serras Giratórias Neon (Sawblades)
// ---------------------------------------------------------------------------
console.log("\n--- TESTE 3: Serras Giratórias Neon ---");
const saw = { x: 1000, y: 520, radius: 24, spinSpeed: 6 };

// 3.1 Fora do alcance
player.x = 900; player.y = 532;
assert(!CollisionEngine.checkPlayerSaw(player, saw), "Jogador longe da serra não colide");

// 3.2 Tocando no disco da serra
player.x = 980; player.y = 510;
assert(CollisionEngine.checkPlayerSaw(player, saw), "Jogador tocando na serra colide");

// 3.3 Pulando com folga segura por cima
player.x = 980; player.y = 440;
assert(!CollisionEngine.checkPlayerSaw(player, saw), "Jogador saltando por cima da serra passa em segurança");


// ---------------------------------------------------------------------------
// TESTE 4: Mecânica de Pulo e Jump Buffer do Player
// ---------------------------------------------------------------------------
console.log("\n--- TESTE 4: Movimento e Pulo do Jogador ---");
player.reset();
assert(player.grounded === true, "Player inicia no chão (grounded = true)");
assert(player.vy === 0, "Player inicia com velocidade vertical zero");

// Salto do chão
player.queueJump([], null, null, null);
assert(player.grounded === false, "Após pular, player sai do chão (grounded = false)");
assert(player.vy === -CONFIG.JUMP_FORCE, `Impulso de salto é de -${CONFIG.JUMP_FORCE} px/s`);

// Buffer de salto no ar
player.grounded = false;
player.coyoteTimer = 0;
player.queueJump([], null, null, null);
assert(player.jumpBufferTimer > 0, "Salto no ar registra buffer para pouso imediato");

// Pouso com buffer ativo dispara pulo imediato
player.land(CONFIG.GROUND_Y, null, null, '#00f0ff', null);
assert(player.vy === -CONFIG.JUMP_FORCE, "Buffer de pulo ativado salta automaticamente no pouso!");

console.log("\n==================================================================");
if (failedTests === 0) {
  console.log("TODOS OS TESTES DE FÍSICA E COLISÃO PASSARAM COM 100% DE SUCESSO!");
} else {
  console.error(`TOTAL DE FALHAS: ${failedTests}`);
}
console.log("==================================================================");
process.exit(failedTests > 0 ? 1 : 0);
