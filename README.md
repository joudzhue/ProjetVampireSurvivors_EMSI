# Projet EMSI Rabat 2025/2026 – Jeu inspiré de Vampire Survivors

## 1. Description générale

Ce projet est un petit jeu 2D inspiré de **Vampire Survivors**.

- Le joueur se déplace dans une arène.
- Des ennemis apparaissent progressivement.
- Le joueur tire automatiquement vers l’ennemi le plus proche.
- Un boss de type **Snake** (serpent composé de segments) apparaît après un certain score.
- Tous les objets qui se déplacent utilisent des **steering behaviors** (forces, vitesse, accélération), comme vu en cours.

L’objectif du projet est de **montrer que je maîtrise les comportements vus avec micbuffa** (seek, flee, wander, separation, obstacle avoidance, etc.) et les patterns de conception (pattern composite pour le Snake).

---

## 2. Technologies utilisées

- **Langage** : JavaScript
- **Librairie graphique** : [p5.js](https://p5js.org/)
- **Paradigme** : Programmation orientée objets
- **Pattern** :
  - Classe de base `Vehicle` (comme en cours)
  - Pattern **Composite** pour la classe `Snake` (un Snake composé de plusieurs segments)

---

## 3. Architecture du code

### 3.1 Fichiers

- `index.html`  
  Charge p5.js et tous les scripts JavaScript du jeu.

- `vehicle.js`  
  Classe de base pour tous les objets mobiles. Contient tous les principaux **steering behaviors** :
  - `seek(target)`
  - `flee(target)`
  - `arrive(target)`
  - `wander()`
  - `separate(vehicles)`
  - `avoidObstacles(obstacles)`

- `player.js`  
  Classe `Player` qui hérite de `Vehicle`.  
  Gère :
  - le déplacement clavier (ZQSD / WASD)
  - les points de vie
  - le tir automatique (création de `Projectile` vers l’ennemi le plus proche)

- `enemy.js`  
  Classe `Enemy` qui hérite de `Vehicle`.  
  Trois types d’ennemis :
  - `chaser` : fonce vers le joueur (seek)
  - `wanderer` : se déplace aléatoirement (wander) + seek léger vers le joueur
  - `coward` : fuit le joueur quand il est trop proche (flee) + wander  
  Ils utilisent aussi :
  - `separate` pour ne pas se coller
  - `avoidObstacles` pour éviter les obstacles

- `projectile.js`  
  Classe `Projectile` qui hérite de `Vehicle`.  
  Les tirs sont eux aussi des véhicules :
  - ils sont dirigés dans la direction de la cible
  - se déplacent à vitesse élevée
  - disparaissent après un certain temps ou lors d’une collision

- `obstacle.js`  
  Obstacles circulaires statiques dans l’arène.  
  Utilisés par `avoidObstacles` pour forcer les véhicules à les contourner.

- `snake.js`  
  Implémente le **boss Snake** :
  - Classe `SnakeSegment` qui hérite de `Vehicle`
  - Classe `Snake` qui contient une **collection de segments**  
    → pattern **Composite** : un objet Snake composé de plusieurs sous-objets `SnakeSegment`.
  - La tête du Snake fait **seek** vers le joueur et **avoidObstacles**.
  - Chaque segment suit le précédent (comportement de suivi).

- `sketch.js`  
  Fichier principal p5.js :
  - `setup()` : initialisation du jeu
  - `draw()` : boucle de jeu
  - gestion du score, des vagues d’ennemis, du boss, du game over
  - gestion des collisions (joueur/ennemis, projectiles/ennemis, etc.)

---

## 4. Behaviors implémentés

Les comportements suivants sont implémentés et utilisés dans le jeu :

- **Seek** :  
  Utilisé par :
  - les ennemis de type `chaser`
  - la tête du Snake
  - certaines combinaisons de mouvements

- **Flee** :  
  Utilisé par :
  - les ennemis de type `coward` qui fuient le joueur quand il est trop proche.

- **Arrive** :  
  Comportement disponible dans `Vehicle`. Peut être utilisé pour faire venir un ennemi ou un objet en ralentissant à l’approche.

- **Wander** :  
  Utilisé pour donner un mouvement aléatoire réaliste :
  - ennemis de type `wanderer`
  - combiné avec d’autres comportements.

- **Separation** :  
  Évite que les ennemis restent collés les uns aux autres.  
  Appelé dans `Enemy.behave()`.

- **Obstacle Avoidance** :  
  Permet aux véhicules d’anticiper une collision avec les obstacles circulaires :
  - utilisé par les ennemis
  - utilisé par la tête du Snake

- **Follow / Snake behaviour** :  
  Pour les segments du Snake, chaque segment suit la position du précédent pour créer un mouvement fluide.

Tous ces comportements sont implémentés en termes de **forces**, **vitesse** et **accélération**, comme dans le cours de steering behaviors.

---

## 5. Gestion des collisions

Les collisions sont toutes basées sur la **distance entre les centres** des objets :

> Il y a collision si  
> `distance(centre1, centre2) < rayon1 + rayon2`

Collisions gérées :

- **Projectiles ↔ Ennemis**
  - Si un projectile touche un ennemi, l’ennemi perd de la vie et le projectile disparaît.
  - Si la vie de l’ennemi atteint 0 → l’ennemi est supprimé et le score augmente.

- **Projectiles ↔ Boss Snake**
  - Si un projectile touche un segment du Snake, le boss perd de la vie.
  - Si la vie du boss atteint 0 → le Snake disparaît et un gros bonus de score est donné.

- **Ennemis ↔ Joueur**
  - Si un ennemi touche le joueur, le joueur perd progressivement de la vie.

- **Boss Snake ↔ Joueur**
  - Si un segment du Snake touche le joueur, il perd aussi de la vie.

---

## 6. Scénario du jeu

1. Le joueur apparaît au centre de l’arène.
2. Des vagues d’ennemis apparaissent régulièrement depuis les bords de l’écran.
3. Le joueur se déplace pour survivre tout en tirant automatiquement vers l’ennemi le plus proche.
4. En éliminant des ennemis, le score augmente.
5. Quand le score atteint un certain seuil, un **boss Snake** apparaît :
   - il évite les obstacles,
   - sa tête cherche le joueur,
   - son corps suit la tête.
6. Si le joueur survit et détruit le Snake, il reçoit un gros bonus de score.
7. La partie se termine quand les points de vie du joueur tombent à 0 → écran de Game Over.

---

## 7. Lien avec le cours et ce qui est demandé dans le sujet

- **Steering behaviors** : tous les déplacements (joueur, ennemis, boss, projectiles) reposent sur la classe `Vehicle` et les behaviors vus en cours.
- **Tirs avec comportements** : les projectiles sont implémentés comme des `Vehicle` et utilisent une direction dérivée de la position de l’ennemi ciblé.
- **Collisions par rayons** : toutes les collisions sont calculées avec la distance entre centres < somme des rayons.
- **Classe Snake + composite** : la classe `Snake` gère une collection de `SnakeSegment`, ce qui correspond à un pattern composite.
- **Séparation** : les ennemis utilisent `separate()` pour ne pas se regrouper sur un seul point.
- **Évitement d’obstacles** : implémenté dans `avoidObstacles` et utilisé notamment par le boss.

---

## 8. Comment lancer le projet

1. Cloner le repository ou télécharger les fichiers.
2. Ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, etc.).
3. Contrôles :
   - `Z` / `Q` / `S` / `D` (ou `W` / `A` / `S` / `D`) : déplacement du joueur.
   - Le tir est automatique : il vise l’ennemi le plus proche.
4. Surveiller :
   - Le **score**
   - Les **points de vie** du joueur
   - Les **points de vie du boss** lorsqu’il apparaît.

---

## 9. Améliorations possibles

Pour aller plus loin, on peut ajouter :
- des power-ups,
- plusieurs types de projectiles,
- un système de niveaux,
- un menu d’accueil,
- des effets sonores.

Ces extensions montrent la compréhension du moteur du jeu tout en restant basées sur les behaviors étudiés en cours.
