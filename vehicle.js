// ==============================
//   Classe Vehicle
// ==============================
//
// Représente un "véhicule" au sens des steering behaviors.
// Tous les objets qui se déplacent dans le jeu (joueur, ennemis,
// projectiles, segments du snake) héritent de cette classe.
//
// On y implémente :
//  - position, vitesse, accélération
//  - update & edges
//  - seek, flee, arrive, wander
//  - separation, avoidObstacles
//

class Vehicle {
  constructor(x, y, maxSpeed = 3, maxForce = 0.15, radius = 12) {
    // position actuelle
    this.pos = createVector(x, y);
    // vitesse courante
    this.vel = p5.Vector.random2D();
    // accélération (somme des forces appliquées)
    this.acc = createVector(0, 0);

    // limites physiques
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;

    // rayon pour les collisions par cercles
    this.radius = radius;

    // angle utilisé pour le comportement wander
    this.wanderTheta = 0;
  }

  // Ajoute une force à l'accélération.
  applyForce(f) {
    this.acc.add(f);
  }

  // Mise à jour : v = v + a, x = x + v
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); // on remet l’accélération à zéro après l’update
  }

  // Gestion des bords de l’écran : tore (wrap-around).
  edges() {
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  // === SEEK =====================================================
  // Retourne une force qui pousse le véhicule vers la cible.
  seek(target) {
    const desired = p5.Vector.sub(target, this.pos); // direction cible
    desired.setMag(this.maxSpeed);                   // vitesse désirée

    const steer = p5.Vector.sub(desired, this.vel);  // steering = desired - vel
    steer.limit(this.maxForce);
    return steer;
  }

  // === FLEE =====================================================
  // Fuir une cible si elle est plus proche que panicDistance.
  flee(target, panicDistance = 80) {
    const desired = p5.Vector.sub(this.pos, target);
    const d = desired.mag();

    if (d < panicDistance) {
      desired.setMag(this.maxSpeed);
      const steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
    // Sinon, aucune force de fuite.
    return createVector(0, 0);
  }

  // === ARRIVE ===================================================
  // Arrive : se diriger vers la cible en ralentissant à l'approche.
  arrive(target, slowRadius = 100) {
    const desired = p5.Vector.sub(target, this.pos);
    const d = desired.mag();

    if (d < slowRadius) {
      // Réduire la vitesse à l’approche
      const m = map(d, 0, slowRadius, 0, this.maxSpeed);
      desired.setMag(m);
    } else {
      desired.setMag(this.maxSpeed);
    }

    const steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // === WANDER ===================================================
  // Wander : mouvement aléatoire mais "lisse" (pas du pur random).
  wander(wanderRadius = 40, wanderDistance = 60, change = 0.3) {
    // Variation progressive de l'angle de wander.
    this.wanderTheta += random(-change, change);

    // Cercle placé devant le véhicule.
    const circlePos = this.vel.copy();
    circlePos.setMag(wanderDistance);
    circlePos.add(this.pos);

    const h = this.vel.heading();

    // Point sur le cercle qui sera la cible instantanée.
    const offset = createVector(
      wanderRadius * cos(this.wanderTheta + h),
      wanderRadius * sin(this.wanderTheta + h)
    );

    const target = p5.Vector.add(circlePos, offset);
    return this.seek(target);
  }

  // === SEPARATION ===============================================
  // Évite que les véhicules se collent entre eux.
  separate(vehicles, desiredSeparation = 30) {
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of vehicles) {
      if (other === this) continue;
      const d = p5.Vector.dist(this.pos, other.pos);

      // Si un autre véhicule est trop proche, on ajoute une force de répulsion.
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d); // plus il est proche, plus la force est grande
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);           // moyenne
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce * 1.5);
    }

    return steer;
  }

  // === OBSTACLE AVOIDANCE =======================================
  // Éviter des obstacles circulaires (même principe que dans le cours).
  avoidObstacles(obstacles, avoidDistance = 80, avoidForce = 0.8) {
    let steer = createVector(0, 0);

    for (let obs of obstacles) {
      // On projette une position future dans la direction de la vitesse.
      const futurePos = p5.Vector.add(
        this.pos,
        this.vel.copy().setMag(avoidDistance)
      );
      const d = p5.Vector.dist(futurePos, obs.pos);

      // Si cette position future risque une collision, on dévie la trajectoire.
      if (d < obs.radius + this.radius + 20) {
        let diff = p5.Vector.sub(futurePos, obs.pos);
        diff.normalize();
        diff.mult(this.maxSpeed * avoidForce);
        diff.sub(this.vel);
        diff.limit(this.maxForce * 2);
        steer.add(diff);
      }
    }
    return steer;
  }

  // Affichage de base (triangle orienté dans la direction de la vitesse).
  show(colorFill = [255, 255, 255]) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();
    fill(...colorFill);
    triangle(
      -this.radius, -this.radius * 0.6,
      -this.radius,  this.radius * 0.6,
      this.radius,   0
    );
    pop();
  }
}
