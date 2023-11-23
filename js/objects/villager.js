import { drawArc, drawCircle, shuffle, drawLine, fillPoints } from '../utility.js';
import { APPLE, ROTTEN_APPLE } from './apple.js';
import { movePoint2, getDistancePts } from '../utility.js';
import { HOME, BASE_VILLAGER_STRENGTH } from './home.js';

export const VILLAGER = 'villager';
export const GATHERER = 'gatherer';
export const WARRIOR = 'warrior';
export const HERO = 'hero';

export default class Villager {
  constructor({
              context,
              environment,
              home,
              x,
              y,
              red,
              green,
              blue,
              radius = 12
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.home = home;
    this.id = Math.random();
    this.x = x ? x : this.home.x;
    this.y = y ? y : this.home.y;
    this.v = { x: 0, y: 0 };
    this.red = red ? red : this.home.red;
    this.green = green ? green : this.home.green;
    this.blue = blue ? blue : this.home.blue;
    this.radius = radius;
    this.impacting = false;
    this.type = VILLAGER;
    this.death = Date.now() + this.home.maxAge;
    if (Math.random() < this.home.villagerAgressiveness) {
      this.subType = WARRIOR;
    } else if (this.home.heroes.length === 0 && Math.random() < this.home.villagerHeroism) {
      this.subType = HERO;
      this.death = Date.now() + (this.home.maxAge * 4);
      this.home.heroes.push(this);
    } else {
      this.subType = GATHERER;
    }
  }

  right() {
    return this.x + this.radius;
  }

  left() {
    return this.x - this.radius;
  }

  bottom() {
    return this.y + this.radius;
  }

  top() {
    return this.y - this.radius;
  }

  draw() {
    if (this.alive) {
      drawCircle({
        context: this.context,
        x: this.x,
        y: this.y,
        radius: this.radius,
        lineWidth: 1,
        lineStyle: `rgba(75, 75, 75, 1)`,
        red: this.red,
        green: this.green,
        blue: this.blue,
      });
      drawArc({
        context: this.context,
        x: this.x,
        y: this.y,
        radius: this.radius,
        lineWidth: 1,
        lineStyle: `rgba(50, 50, 50, 1)`,
        percent: (this.timeRemaining / this.home.maxAge) * 100
      });
      if (this.subType === WARRIOR) {
        drawArc({
          context: this.context,
          x: this.x,
          y: this.y,
          radius: this.radius - 4,
          lineWidth: 2.5,
          lineStyle: `rgba(255, 0, 0, 1)`,
          percent: ((this.strength / BASE_VILLAGER_STRENGTH) * 50)
        });
        drawArc({
          context: this.context,
          x: this.x,
          y: this.y,
          radius: this.radius - 4,
          lineWidth: 0.5,
          lineStyle: `rgba(255, 0, 0, 1)`
        });
      } else if (this.subType === HERO) {
        const xShift = 0.92 * this.radius;
        const yShift = 0.30 * this.radius;
        const length = this.radius * 2.5;
        const width = this.radius;
        const crossShift = this.radius * 1;
        drawLine(
          this.context,
          {
            x: this.x + xShift,
            y: this.y - yShift
          },
          {
            x: this.x + xShift,
            y: this.y - yShift - length
          },
          2,
          'rgb(128,128,128)'
        )
        drawLine(
          this.context,
          {
            x: this.x + xShift - (width * 0.5),
            y: this.y - yShift - crossShift
          },
          {
            x: this.x + xShift + (width * 0.5),
            y: this.y - yShift - crossShift
          },
          2,
          'rgb(128,128,128)'
        )
        const shieldSizeX = 1.5 * this.radius;
        const shieldSizeY = 1.5 * this.radius;
        const shieldShiftX = -1.25 * this.radius;
        const shieldShiftY = -1.25 * this.radius;
        fillPoints({
          context: this.context,
          points: [
            {
              x: this.x - (shieldSizeX / 2) + shieldShiftX,
              y: this.y + shieldShiftY,
            },
            {
              x: this.x + shieldShiftX,
              y: this.y + shieldSizeY + shieldShiftY,
            },
            {
              x: this.x + (shieldSizeX / 2) + shieldShiftX,
              y: this.y + shieldShiftY,
            }
          ],
          shift: 0,
          fillRed: 0,
          fillGreen: 0,
          fillBlue: 0
        })
      }
    }
  }

  get timeRemaining() {
    return this.death - Date.now();
  }

  get alive() {
    return this.timeRemaining > 0;
  }

  move() {
    if (this.destination && getDistancePts(this, this.destination) > (this.radius + this.destination.radius)) {
      this.moveToDestination();
    } else if (this.hunting && this.destination.id === this.hunting.id) {
      this.attackTarget();
    } else if (this.destination && this.destination.type === APPLE) {
      this.takeAppleHome();
    } else if (this.destination && this.destination.type === HOME && this.home.id !== this.destination.id) {
      this.fightEnemyHome();
    } else if (this.destination && this.destination.type === HOME) {
      this.consumeApple();
      this.findPreferredTarget();
    } else {
      this.findPreferredTarget();
    }
  }

  attackTarget() {
    this.hunting.destroy = true;
    this.hunting = undefined;
    this.findBadGuy();
  }

  fightEnemyHome() {
    this.destination.heroTargets.push(this);
    const stolenFood = this.destination.food > this.strength ? this.strength : this.destination.food;
    if (stolenFood > 0) {
      this.destination.food = this.destination.food > this.strength ? this.destination.food -= this.strength : 0;
      const apple = this.environment.addStolenApple(this.x, this.y, stolenFood);
      apple.location = this;
      this.carrying = apple;
      this.destination = this.home;
    } else {
      this.findPreferredTarget();
    }
  }

  findPreferredTarget() {
    if (this.subType === WARRIOR) {
      this.findEnemyVillage();
    } else if (this.subType === HERO) {
      this.findBadGuy();
    } else {
      this.findApple()
    }
  }

  findBadGuy() {
    this.home.heroTargets = this.home.heroTargets.filter(obj => !obj.destroy);
    if (this.home.heroTargets.length > 0) {
      setTimeout(() => {
        this.destination = shuffle(this.home.heroTargets)[0];
        this.hunting = this.destination;
      }, this.agility * 10000);
    } else {
      this.destination = this.home;
    }
  }

  consumeApple() {
    if (this.carrying &&
        this.carrying.type === APPLE &&
        this.carrying.location &&
        this.carrying.location.id === this.id &&
        !this.carrying.destroy
    ) {
      this.home.food = this.home.food + this.carrying.food;
      this.carrying.destroy = true;
    } else if (this.carrying && this.carrying.type === ROTTEN_APPLE) {
      this.carrying.destroy = true;
    }
  }

  rest() {
    this.destination = undefined;
  }

  get agility() {
    return this.home.villagerAgility * (this.subType === HERO ? 1.2 : 1);
  }

  get maxSpeed() {
    return this.home.villagerMaxSpeed * (this.subType === HERO ? 1.2 : 1);
  }

  get strength() {
    return this.home.villagerStrength * (this.subType === HERO ? 1.2 : 1);
  }

  moveToDestination() {
    this.v = movePoint2(this, this.destination, this.v, this.agility, this.maxSpeed);
    this.x = this.x + this.v.x;
    this.y = this.y + this.v.y;
  }

  get currentSpeed() {
    return Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y);
  }

  takeAppleHome() {
    if (this.destination.location && this.destination.location.id !== this.id) {
      this.findPreferredTarget();
    } else if (this.destination && this.destination.type === APPLE) {
      this.destination.location = this;
      this.carrying = this.destination;
      this.destination = this.home;
    } else {
      this.findPreferredTarget();
    }
  }

  goFurther() {
    return Math.random() < this.home.adventurousness;
  }

  findEnemyVillage() {
    this.destination = undefined;
    if (this.grids) {
      this.grids.forEach((grid, index) => {
        if (!this.destination && this.goFurther()) {
          const objs = this.environment.grids[index].rows[grid.row][grid.col] || [];
          this.destination = this.findVillageFromList(objs);
        }
      });
    }
    if (!this.destination) {
      this.destination = this.findAppleFromList(this.environment.objects);
    }
  }

  findApple() {
    this.destination = undefined;
    if (this.grids) {
      this.grids.forEach((grid, index) => {
        if (!this.destination && this.goFurther()) {
          const objs = this.environment.grids[index].rows[grid.row][grid.col] || [];
          this.destination = this.findAppleFromList(objs);
        }
      });
    }
    if (!this.destination) {
      this.destination = this.findAppleFromList(this.environment.objects);
    }
  }

  findVillageFromList(objects) {
    return shuffle(objects).find(obj => {
      return obj.type === HOME
        && this.home.id != obj.id
        && !this.home.isParentOf(obj)
        && !obj.isParentOf(this);
    });
  }

  findAppleFromList(objects) {
    return shuffle(objects).find(obj => obj.type === APPLE && !obj.location);
  }

  migrateToNewHome(newHome) {
    this.red = newHome.red;
    this.green = newHome.green;
    this.blue = newHome.blue;
    this.home = newHome;
    newHome.villagers.push(this);
  }

  update() {
    if (!this.destination) {
      this.findPreferredTarget();
    }
    this.draw();
    this.move();
  }

  minorUpdate() {
  }

  majorUpdate() {
    if (!this.alive) {
      this.destroy = true;
      if (this.carrying) {
        this.carrying.location = undefined;
      }
    }
  }
}
