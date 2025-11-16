// ==============================
//   Classe Obstacle
// ==============================
//
// Représente un obstacle circulaire fixe dans l’arène.
// Utilisé par le comportement avoidObstacles des Vehicles.
//

class Obstacle {
  constructor(x, y, r = 30) {
    this.pos = createVector(x, y);
    this.radius = r;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    fill(120, 120, 120, 200);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    pop();
  }
}
