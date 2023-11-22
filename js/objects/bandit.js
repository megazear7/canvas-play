import { randomX, randomY, drawRect, shuffle, writeText, percentAdjust } from '../utility.js';
import { movePoint2, getDistancePts } from '../utility.js';
import { VILLAGER } from './villager.js';

export const BANDIT = 'bandit';
const BANDIT_MAX_SPEED = 0.5;
const BANDIT_AGILITY = 0.01;
const BANDIT_BASE_GIVE_UP_DISTANCE = 200;

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
              maxSpeed = BANDIT_MAX_SPEED * percentAdjust(0.3),
              agility = BANDIT_AGILITY * percentAdjust(0.3),
              giveUpDistance = BANDIT_BASE_GIVE_UP_DISTANCE * percentAdjust(0.3)
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
    this.v = { x: 0, y: 0 };
    this.maxSpeed = maxSpeed;
    this.agility = agility;
    this.giveUpDistance = giveUpDistance;
    this.impacting = false;
    this.type = BANDIT;
    this.maxAge = 10000 + (Math.random() * 25000);
    this.death = Date.now() + this.maxAge;
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
    } else if (this.destination && getDistancePts(this, this.destination) > this.giveUpDistance) {
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
    this.v = movePoint2(this, this.destination, this.v, this.agility, this.maxSpeed);
    this.x = this.x + this.v.x;
    this.y = this.y + this.v.y;
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
