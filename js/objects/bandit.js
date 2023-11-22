import { randomX, randomY, drawRect, shuffle, writeText, percentAdjust } from '../utility.js';
import { movePoint, getDistancePts } from '../utility.js';
import { HOME } from './home.js';
import { VILLAGER } from './villager.js';

export const BANDIT = 'bandit';

export default class Bandit {
  constructor({
              context,
              environment,
              x = randomX(),
              y = randomY(),
              red = 0,
              green = 0,
              blue = 0,
              size = 20,
              speed = 1000
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.id = Math.random();
    this.x = x ? x : this.home.x;
    this.y = y ? y : this.home.y;
    this.dx = 0;
    this.dy = 0;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.size = size;
    this.speed = speed;
    this.impacting = false;
    this.type = BANDIT;
    this.maxAge = 10000 + (Math.random() * 25000);
    this.death = Date.now() + this.maxAge;
  }

  right() {
    return this.x + this.size;
  }

  left() {
    return this.x - this.size;
  }

  bottom() {
    return this.y + this.size;
  }

  top() {
    return this.y - this.size;
  }

  draw() {
    if (this.alive) {
      drawRect({
        context: this.context,
        x: this.x,
        y: this.y,
        w: this.size,
        h: this.size,
        r: this.red,
        g: this.green,
        b: this.blue,
      });
      writeText({
        context: this.context,
        text: parseInt(this.timeRemaining / 1000),
        x: this.x + 3,
        y: this.y + (this.size / 2) + 3,
        red: 255,
        green: 255,
        blue: 255
      });
    }
  }

  get timeRemaining() {
    return this.death - Date.now();
  }

  get alive() {
    return this.timeRemaining > 0;
  }

  move() {
    if (this.destination && this.destination.destroy) {
      this.findTarget();
    } else if (this.destination && getDistancePts(this, this.destination) > ((this.size / 2) + this.destination.radius)) {
      this.moveToDestination();
    } else if (this.destination && this.destination.type === VILLAGER) {
      this.killVillager();
    } else {
      this.findTarget();
    }
  }

  killVillager() {
    this.death += (this.destination.timeRemaining * 0.5);
    this.destination.destroy = true;
    this.destination = undefined;
  }

  findTarget() {
    this.destination = undefined;
    if (this.grids && Math.random()) {
      this.grids.forEach((grid, index) => {
        if (!this.destination) {
          const objs = this.environment.grids[index].rows[grid.row][grid.col] || [];
          this.destination = this.findTargetFromList(objs);
        }
      });
    }
    if (!this.destination) {
      this.destination = this.findTargetFromList(this.environment.objects);
    }
  }

  findTargetFromList(objects) {
    return shuffle(objects).find(obj => obj.type === VILLAGER && !obj.destroy);
  }

  moveToDestination() {
    const p = movePoint(this, this, this.destination, this.speed);
    this.x = p.x;
    this.y = p.y;
  }

  update() {
    this.draw();
    this.move();
  }

  minorUpdate() {
  }

  majorUpdate() {
    if (!this.alive) {
      this.destroy = true;
    }
  }
}
