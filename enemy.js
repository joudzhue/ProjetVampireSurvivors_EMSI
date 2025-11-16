// ==============================
//   Classe Enemy (ennemi)
// ==============================
//
// Hérite de Vehicle.
// Trois types d'ennemis utilisant des combinaisons de comportements :
//  - "chaser"   : seek sur le joueur
//  - "wanderer" : wander + seek léger
//  - "coward"   : flee si trop proche + wander
// Tous utilisent separation + avoidObstacles.
//

class Enemy extends Vehicle {
  constructor(x, y, type = "chaser") {
    // Vitesse un peu plus faible que celle du joueur.
    super(x, y, 2.5, 0.12, 12);
    this.type = type;
    this.health = 30;
    this.baseColor = [255, 100, 100];
  }

  // Calcule et applique le comportement global de l’ennemi.
  behave(player, enemies, obstacles) {
    let steering = createVector(0, 0);

    // Comportement principal en fonction du type.
    if (this.type === "chaser") {
      // Fonce vers le joueur
      steering.add(this.seek(player.pos));
    } else if (this.type === "wanderer") {
      // Se promène aléatoirement + un peu attiré par le joueur
      steering.add(this.wander());
      steering.add(this.seek(player.pos).mult(0.4));
    } else if (this.type === "coward") {
      // Fuit le joueur quand il est proche + wander
      steering.add(this.flee(player.pos, 120));
      steering.add(this.wander().mult(0.5));
    }

    // Separation pour éviter les groupements irréalistes
    steering.add(this.separate(enemies).mult(1.2));

    // Évitement des obstacles
    steering.add(this.avoidObstacles(obstacles, 80, 1.0));

    this.applyForce(steering);
  }

  // Dégâts reçus
  takeDamage(amount) {
    this.health -= amount;
  }

  // L’ennemi est mort si sa vie tombe à 0.
  isDead() {
    return this.health <= 0;
  }

  // Affichage simple (cercle rouge).
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();
    fill(this.baseColor[0], this.baseColor[1], this.baseColor[2]);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    pop();
  }
}
