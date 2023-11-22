import { randomX, randomY, drawCircle, movePoint, randomNumber } from '../utility.js';
export const APPLE = 'apple';
export const ROTTEN_APPLE = 'rotten_apple';

export default class Apple {
  constructor({
              context,
              environment,
              x = randomX(),
              y = randomY(),
              radius = 6,
              minFood = 11,
              maxFood = 22,
              randomFood = false,
              ageRate = 1,
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.minFood = minFood;
    this.maxFood = maxFood;
    this.ageRate = ageRate;
    this.food = randomFood ? randomNumber({ min: minFood, max: maxFood }) : minFood;
    this.type = APPLE;
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
    if (this.type === ROTTEN_APPLE) {
      drawCircle({
        context: this.context,
        x: this.x,
        y: this.y,
        radius: this.radius * 0.75,
        lineWidth: 1,
        red: 100,
        green: 200,
        blue: 100
      }); 
    } else {
      drawCircle({
        context: this.context,
        x: this.x,
        y: this.y,
        radius: this.radius,
        lineWidth: 1,
        red: this.red,
        green: 0,
        blue: 0
      });
    }
  }

  get red() {
    return (((this.food - this.minFood) / (this.maxFood - this.minFood)) * 100) + 155;
  }

  update() {
    this.draw();
    if (this.location && this.location.destination) {
      const p = movePoint(this, this, this.location, 10000);
      this.x = p.x;
      this.y = p.y;
    }
  }

  minorUpdate() {
  }

  majorUpdate() {
    if (this.food < this.maxFood) {
      this.food += this.ageRate * 0.1;
    } else if (this.type !== ROTTEN_APPLE) {
      this.food = 0;
      this.type = ROTTEN_APPLE;
      setTimeout(() => this.destroy = true, 5000);
    }
  }
}
