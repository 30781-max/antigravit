# 🎮 CYBER PULSE — Guia e Manual de Desenvolvimento

Bem-vindo ao projeto do **CYBER PULSE**, seu jogo 2D neon inspirado em Geometry Dash!
Todo o código foi totalmente modularizado na pasta `js/` para que você possa entender, customizar e criar novas fases ou skins sem complicação.

---

## 📁 Estrutura dos Arquivos em `js/`

| Arquivo | Função | O que você pode alterar aqui |
|---|---|---|
| [`config.js`](file:///c:/Users/nilso/Music/antigravit/js/config.js) | **Física e Constantes** | Gravidade (`GRAVITY: 2150`), força do pulo (`JUMP_FORCE: 690`), altura do chão (`GROUND_Y: 570`) e do teto (`CEILING_Y: 150`). |
| [`levels.js`](file:///c:/Users/nilso/Music/antigravit/js/levels.js) | **As 10 Fases do Jogo** | Espaçamento entre obstáculos, novos espinhos, blocos, plataformas, abismos, trampolins e portais de gravidade. |
| [`skins.js`](file:///c:/Users/nilso/Music/antigravit/js/skins.js) | **Catálogo de Skins** | Cores neon, rostos digitais, núcleos luminosos, badges e efeitos visuais do cubo. |
| [`collision.js`](file:///c:/Users/nilso/Music/antigravit/js/collision.js) | **Motor de Colisões** | Detecção de caixa AABB, colisão triangular de espinhos, impacto fatal contra blocos e pouso no topo. |
| [`player.js`](file:///c:/Users/nilso/Music/antigravit/js/player.js) | **Entidade do Cubo** | Pulo, buffer de salto, tolerância coyote time e renderização da skin ativa. |
| [`game.js`](file:///c:/Users/nilso/Music/antigravit/js/game.js) | **Loop e Renderizador** | Câmera suave, modais de interface (Skins, Fases, Pausa, Vitória) e desenho dos blocos geométricos. |
| [`audio.js`](file:///c:/Users/nilso/Music/antigravit/js/audio.js) | **Sintetizador Web Audio** | Efeitos sonoros de pulo, trampolim, portal, morte e música chiptune procedural em tempo real. |
| [`particles.js`](file:///c:/Users/nilso/Music/antigravit/js/particles.js) | **Sistema de Partículas** | Rastros do cubo, faíscas de pulo, poeira de aterrissagem e explosões. |
| [`main.js`](file:///c:/Users/nilso/Music/antigravit/js/main.js) | **Ponto de Partida** | Inicializa o `window.game` quando a página carrega. |

---

## 🧱 Tipos de Obstáculos Disponíveis no Jogo

1. **Espinho Simples no Chão:**
   `{ x: 1700, w: 36, h: 42 }`
2. **Fileira de Espinhos Duplos ou Triplos:**
   `{ x: 8400, w: 36, h: 42 }, { x: 8436, w: 36, h: 42 }`
3. **Bloco Sólido no Chão para Pular por Cima (Estilo Geometry Dash):**
   `{ x: 3100, y: 528, w: 45, h: 42, isBlock: true }`
   *(Se bater de frente mata; se pular no topo o cubo aterrissa e corre por cima!)*
4. **Plataformas Suspensas em Várias Alturas:**
   - Degrau Baixo: `{ x: 4400, y: 480, w: 340, h: 25 }`
   - Degrau Médio: `{ x: 5000, y: 420, w: 450, h: 25 }`
   - Degrau Alto: `{ x: 6500, y: 370, w: 450, h: 25 }`
5. **Espinho no Topo de Plataforma:**
   `{ x: 5280, w: 36, h: 42, y: 420 - 42 }`
6. **Obstáculo Suspenso no Ar (Passar por baixo correndo):**
   `{ x: 7400, y: 410, w: 60, h: 40, isBlock: true }`
7. **Buraco no Chão (Abismo):**
   `{ startX: 4400, endX: 4620 }`
8. **Trampolim Neon (Jump Pad):**
   `{ x: 8150, y: 558, w: 48, h: 12, bounceForce: 950 }`
9. **Portal de Inversão de Gravidade:**
   - Inverte para o teto: `{ x: 4400, w: 52, targetGravity: -1 }`
   - Retorna ao chão: `{ x: 9600, w: 52, targetGravity: 1 }`
10. **Espinhos no Teto (Invertidos):**
    `{ x: 6200, w: 36, h: 42, inverted: true }`

---

## ⏱️ Regra de Ouro dos Espaçamentos
- Em qualquer velocidade do jogo, o tempo de reação humano ideal fica entre **0.40s e 1.50s**.
- Sempre mantenha pelo menos **800px a 1400px** de distância entre o pouso de um obstáculo e o início do próximo para o jogador respirar e se preparar.
- Antes de seções difíceis, trampolins ou portais, coloque sempre uma dica visual no cenário (`hints`) e uma pista livre de corrida!
