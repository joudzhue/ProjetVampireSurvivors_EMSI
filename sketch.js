// ==============================
//   sketch.js (p5.js)
// ==============================
//
// Contient la boucle de jeu : setup() et draw().
// Gère :
//  - création du joueur, des ennemis, du boss, des obstacles
//  - collisions
//  - score, HUD, game over
//

let player;
let enemies = [];
let projectiles = [];
let obstacles = [];
let snakeBoss;

let score = 0;
let spawnTimer = 0;
let bossSpawned = false;
let gameOver = false;

function setup() {
  // Taille de la fenêtre de jeu.
  createCanvas(900, 600);

  // Création du joueur au centre.
  player = new Player(width / 2, height / 2);

  // Création de quelques obstacles fixes.
  obstacles.push(new Obstacle(width * 0.3, height * 0.4, 40));
  obstacles.push(new Obstacle(width * 0.7, height * 0.6, 50));
  obstacles.push(new Obstacle(width * 0.5, height * 0.2, 35));
}

function draw() {
  background(15);

  if (gameOver) {
    drawGameOver();
    return;
  }

  // ---------------------------
  //   Spawning des ennemis
  // ---------------------------
  spawnTimer++;
  if (spawnTimer > 40) {
    spawnEnemy();
    spawnTimer = 0;
  }

  // Apparition du boss lorsque le score est suffisant.
  if (!bossSpawned && score >= 50) {
    snakeBoss = new Snake(width / 2, 80, 10);
    bossSpawned = true;
  }

  // ---------------------------
  //   Joueur
  // ---------------------------
  player.handleInput();
  player.update();
  player.edges();
  player.autoShoot(enemies, projectiles);
  player.show();

  // ---------------------------
  //   Obstacles
  // ---------------------------
  for (let obs of obstacles) {
    obs.show();
  }

  // ---------------------------
  //   Ennemis
  // ---------------------------
  for (let e of enemies) {
    e.behave(player, enemies, obstacles);
    e.update();
    e.edges();
    e.show();
  }

  // ---------------------------
  //   Boss Snake
  // ---------------------------
  if (bossSpawned && snakeBoss && snakeBoss.alive) {
    snakeBoss.behave(player, obstacles);
    snakeBoss.update();
    snakeBoss.show();
  }

  // ---------------------------
  //   Projectiles
  // ---------------------------
  for (let p of projectiles) {
    p.update();
    p.show();
  }

  // ---------------------------
  //   Collisions
  // ---------------------------
  handleProjectileCollisions();
  handleEnemyPlayerCollisions();

  // Collision boss / joueur
  if (bossSpawned && snakeBoss && snakeBoss.alive && snakeBoss.hitsPlayer(player)) {
    player.takeDamage(0.5);
  }

  // Nettoyage des objets morts.
  enemies = enemies.filter(e => !e.isDead());
  projectiles = projectiles.filter(p => !p.isDead());

  if (bossSpawned && snakeBoss && !snakeBoss.alive) {
    // Bonus de score si le boss est détruit.
    score += 100;
  }

  // Vérification de la mort du joueur.
  if (player.isDead()) {
    gameOver = true;
  }

  // Affichage du HUD (score, vie...).
  drawHUD();
}

// Crée un nouvel ennemi sur un bord de l’écran.
function spawnEnemy() {
  const side = floor(random(4));
  let x, y;

  if (side === 0) { // haut
    x = random(width);
    y = -20;
  } else if (side === 1) { // bas
    x = random(width);
    y = height + 20;
  } else if (side === 2) { // gauche
    x = -20;
    y = random(height);
  } else { // droite
    x = width + 20;
    y = random(height);
  }

  // Choix du type d'ennemi.
  const types = ["chaser", "wanderer", "coward"];
  const t = random(types);
  enemies.push(new Enemy(x, y, t));
}

// Gestion des collisions projectiles ↔ ennemis & boss.
function handleProjectileCollisions() {
  for (let p of projectiles) {

    // Projectiles contre ennemis "simples".
    for (let e of enemies) {
      const d = p5.Vector.dist(p.pos, e.pos);
      if (d < p.radius + e.radius) {
        e.takeDamage(10);
        p.lifespan = 0;
        if (e.isDead()) score += 5;
      }
    }

    // Projectiles contre le boss Snake.
    if (bossSpawned && snakeBoss && snakeBoss.alive) {
      const hitBoss = snakeBoss.checkProjectileHit(p);
      if (hitBoss) {
        p.lifespan = 0;
        if (!snakeBoss.alive) score += 50;
      }
    }
  }
}

// Gestion collisions ennemis ↔ joueur.
function handleEnemyPlayerCollisions() {
  for (let e of enemies) {
    const d = p5.Vector.dist(e.pos, player.pos);
    if (d < e.radius + player.radius) {
      // On enlève petit à petit la vie si un ennemi touche le joueur.
      player.takeDamage(0.2);
    }
  }
}

// Affichage des infos de jeu : score, vie, vie du boss.
function drawHUD() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Score : " + score, 10, 10);
  text("Vie   : " + nf(player.health, 3, 0), 10, 30);

  if (bossSpawned && snakeBoss && snakeBoss.alive) {
    text("Boss HP : " + nf(snakeBoss.health, 3, 0), 10, 50);
  }
}

// Écran de fin de partie.
function drawGameOver() {
  background(5, 0, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("GAME OVER", width / 2, height / 2 - 30);
  textSize(20);
  text("Score final : " + score, width / 2, height / 2 + 10);
  text("Appuie sur R pour recommencer", width / 2, height / 2 + 40);
}

// Permet de relancer une partie.
function keyPressed() {
  if (gameOver && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

// Réinitialise toutes les variables du jeu.
function resetGame() {
  player = new Player(width / 2, height / 2);
  enemies = [];
  projectiles = [];
  snakeBoss = null;
  bossSpawned = false;
  score = 0;
  gameOver = false;
}
