// ==============================
//   SnakeSegment & Snake
// ==============================
//
// Implémente un ennemi "boss" de type serpent.
//
// - SnakeSegment hérite de Vehicle : chaque segment se déplace
//   en suivant le précédent.
//
// - Snake est un objet composite qui contient une liste de segments.
//   La tête du serpent fait seek sur le joueur + avoidObstacles,
//   et les segments suivent sa position.
//

// Un segment de serpent : petit Vehicle qui suit un point.
class SnakeSegment extends Vehicle {
  constructor(x, y) {
    super(x, y, 3, 0.2, 10);
  }

  // Suit une position cible (en général le segment précédent).
  follow(targetPos) {
    const desired = p5.Vector.sub(targetPos, this.pos);
    const d = desired.mag();

    if (d > 1) {
      desired.setMag(this.maxSpeed);
      const steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 2);
      this.applyForce(steer);
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    fill(150, 255, 150);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    pop();
  }
}

// Classe composite : gère une collection de segments.
class Snake {
  constructor(x, y, numSegments = 8) {
    this.segments = [];
    for (let i = 0; i < numSegments; i++) {
      // On place les segments alignés au début.
      this.segments.push(new SnakeSegment(x - i * 15, y));
    }
    this.head = this.segments[0]; // la tête est le premier segment
    this.health = 150;
    this.alive = true;
  }

  // Comportement global du Snake.
  behave(player, obstacles) {
    if (!this.alive) return;

    let steering = createVector(0, 0);

    // La tête cherche le joueur et évite les obstacles.
    steering.add(this.head.seek(player.pos));
    steering.add(this.head.avoidObstacles(obstacles, 80, 1.2));
    this.head.applyForce(steering);

    // Chaque segment suit le précédent.
    for (let i = 1; i < this.segments.length; i++) {
      const targetPos = this.segments[i - 1].pos;
      this.segments[i].follow(targetPos);
    }
  }

  update() {
    if (!this.alive) return;
    for (let seg of this.segments) {
      seg.update();
      seg.edges();
    }
  }

  show() {
    if (!this.alive) return;
    // On dessine de la queue vers la tête pour un meilleur rendu.
    for (let i = this.segments.length - 1; i >= 0; i--) {
      this.segments[i].show();
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  // Vérifie si un projectile touche un segment.
  // Si oui, on inflige des dégâts au boss.
  checkProjectileHit(projectile) {
    if (!this.alive) return false;
    for (let seg of this.segments) {
      const d = p5.Vector.dist(seg.pos, projectile.pos);
      if (d < seg.radius + projectile.radius) {
        this.takeDamage(10);
        return true;
      }
    }
    return false;
  }

  // Collision avec le joueur : si un segment touche le joueur.
  hitsPlayer(player) {
    if (!this.alive) return false;
    for (let seg of this.segments) {
      const d = p5.Vector.dist(seg.pos, player.pos);
      if (d < seg.radius + player.radius) {
        return true;
      }
    }
    return false;
  }
}
