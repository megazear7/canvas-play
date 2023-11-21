import { randomX, randomY, randomColor, drawCircle, shuffle } from '../utility.js';
import { APPLE } from './apple.js';
import { movePoint, getDistancePts } from '../utility.js';
import { HOME } from './home.js';

export const VILLAGER = 'villager';

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
              radius = 12,
              speed = 1000
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.home = home;
    this.id = Math.random();
    this.x = x ? x : this.home.x;
    this.y = y ? y : this.home.y;
    this.dx = 0;
    this.dy = 0;
    this.red = red ? red : this.home.red;
    this.green = green ? green : this.home.green;
    this.blue = blue ? blue : this.home.blue;
    this.radius = radius;
    this.speed = speed;
    this.impacting = false;
    this.type = VILLAGER;
    this.maxAge = 20000 + (Math.random() * 22000);
    this.death = Date.now() + this.maxAge;
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
    drawCircle({context: this.context, x: this.x, y: this.y, radius: this.radius, lineWidth: 0, red: this.red, green: this.green, blue: this.blue});
  }

  move() {
    if (this.destination && getDistancePts(this, this.destination) > this.radius * 2) {
      this.moveToDestination();
    } else if (this.destination && this.destination.type === APPLE) {
      this.takeAppleHome();
    } else if (this.destination && this.destination.type === HOME) {
      this.consumeApple();
      this.findApple();
    }
  }

  consumeApple() {
    if (this.destination.carrying && this.destination.carrying != this) {
      // Do nothing
    } else if (this.carrying && this.carrying.type === APPLE && !this.carrying.destroy) {
      this.home.food = this.home.food + this.carrying.food;
      this.carrying.destroy = true;
    }
  }

  rest() {
    this.destination = undefined;
  }

  moveToDestination() {
    const p = movePoint(this, this, this.destination, this.speed);
    this.x = p.x;
    this.y = p.y;
  }

  takeAppleHome() {
    if (this.destination.carrying) {
      this.findApple();
    }
    if (this.destination && this.destination.type === APPLE) {
      this.destination.location = this;
      this.carrying = this.destination;
    }
    this.destination = this.home;
  }

  findApple() {
    this.destination = shuffle(this.environment.objects).find(obj => {
      return obj.type === APPLE && !obj.location;
    });
  }

  update() {
    if (!this.destination) {
      this.findApple();
    }
    this.draw();
    this.move();
  }

  majorUpdate() {
    if (Date.now() > this.death) {
      this.destroy = true;
    }
  }
}
