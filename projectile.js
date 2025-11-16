// ==============================
//   Classe Projectile (tir)
// ==============================
//
// Les tirs sont aussi des Vehicles :
//  - ils ont une vitesse initiale dans une direction donnée,
//  - ils avancent tout seuls,
//  - ils ont une durée de vie limitée.
//

class Projectile extends Vehicle {
  constructor(x, y, dir) {
    // maxSpeed élevée pour que le projectile soit rapide.
    super(x, y, 7, 0.2, 6);

    // La vitesse est alignée sur la direction donnée.
    this.vel = dir.copy().setMag(this.maxSpeed);

    // Durée de vie en nombre de frames
    this.lifespan = 90;
  }

  update() {
    super.update();
    this.lifespan--;
  }

  // Un projectile est "mort" quand sa durée de vie est écoulée.
  isDead() {
    return this.lifespan <= 0;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    fill(255, 255, 100);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    pop();
  }
}
