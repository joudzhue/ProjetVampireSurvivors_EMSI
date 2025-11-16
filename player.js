// ==============================
//   Classe Player (joueur)
// ==============================
//
// Hérite de Vehicle pour bénéficier de la gestion des forces,
// vitesses et comportements. Le joueur est contrôlé au clavier
// et tire automatiquement vers l’ennemi le plus proche.
//

class Player extends Vehicle {
  constructor(x, y) {
    // maxSpeed plus grande que les ennemis pour pouvoir les esquiver.
    super(x, y, 4, 0.2, 14);
    this.fireCooldown = 0;  // frames avant le prochain tir possible
    this.fireRate = 20;     // cadence de tir (en frames)
    this.health = 100;      // points de vie du joueur
  }

  // Lecture des entrées clavier (ZQSD/WASD).
  handleInput() {
    let dir = createVector(0, 0);

    // Q ou A = gauche
    if (keyIsDown(65) || keyIsDown(81)) dir.x -= 1;
    // D = droite
    if (keyIsDown(68)) dir.x += 1;
    // Z ou W = haut
    if (keyIsDown(87)) dir.y -= 1;
    // S = bas
    if (keyIsDown(83)) dir.y += 1;

    if (dir.mag() > 0) {
      dir.setMag(this.maxSpeed);
      const steer = p5.Vector.sub(dir, this.vel);
      steer.limit(this.maxForce * 2);
      this.applyForce(steer);
    }
  }

  // Tir automatique : choisit l'ennemi le plus proche et crée un projectile.
  autoShoot(enemies, projectiles) {
    // Gestion de la cadence de tir.
    if (this.fireCooldown > 0) {
      this.fireCooldown--;
      return;
    }
    if (enemies.length === 0) return;

    // Recherche de l’ennemi le plus proche.
    let closest = null;
    let minDist = Infinity;
    for (let e of enemies) {
      const d = p5.Vector.dist(this.pos, e.pos);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    }

    // Création d’un projectile dirigé vers cet ennemi.
    if (closest) {
      const dir = p5.Vector.sub(closest.pos, this.pos);
      dir.normalize();
      const proj = new Projectile(this.pos.x, this.pos.y, dir);
      projectiles.push(proj);
      this.fireCooldown = this.fireRate;
    }
  }

  // Applique des dégâts au joueur.
  takeDamage(amount) {
    this.health -= amount;
    this.health = max(this.health, 0);
  }

  // Indique si le joueur est mort.
  isDead() {
    return this.health <= 0;
  }

  // Affichage du joueur (triangle bleu).
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();
    fill(50, 200, 255);
    triangle(
      -this.radius, -this.radius * 0.7,
      -this.radius,  this.radius * 0.7,
      this.radius,   0
    );
    pop();
  }
}
