import { drawArc, drawCircle, shuffle } from '../utility.js';
import { APPLE, ROTTEN_APPLE } from './apple.js';
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
    this.maxAge = 20000 + (Math.random() * 25000);
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
        percent: (this.timeRemaining / this.maxAge) * 100
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
    if (this.destination && getDistancePts(this, this.destination) > (this.radius + this.destination.radius)) {
      this.moveToDestination();
    } else if (this.destination && this.destination.type === APPLE) {
      this.takeAppleHome();
    } else if (this.destination && this.destination.type === HOME) {
      this.consumeApple();
      this.findApple();
    } else {
      this.findApple();
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

  moveToDestination() {
    const p = movePoint(this, this, this.destination, this.speed);
    this.x = p.x;
    this.y = p.y;
  }

  takeAppleHome() {
    if (this.destination.location && this.destination.location.id !== this.id) {
      this.findApple();
    } else if (this.destination && this.destination.type === APPLE) {
      this.destination.location = this;
      this.carrying = this.destination;
      this.destination = this.home;
    } else {
      this.findApple();
    }
  }

  findApple() {
    this.destination = shuffle(this.environment.objects).find(obj => {
      return obj.type === APPLE && !obj.location;
    });
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
      this.findApple();
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
