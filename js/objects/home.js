import { randomX, randomY, drawCircle, writeText } from '../utility.js';
import Villager from './villager.js';
export const HOME = 'home';

export default class Home {
  constructor({
              context,
              environment,
              x = randomX(),
              y = randomY(),
              red = 50,
              green = 50,
              blue = 50,
              radius = 25,
              food = 0,
            } = {}) {
    this.context = context;
    this.environment = environment;
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.radius = radius;
    this.food = food;
    this.type = HOME;
    this.addVillager();
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
    writeText({
      context: this.context,
      text: parseInt(this.food),
      x: this.x,
      y: this.y
    });
  }

  update() {
    this.draw();
  }

  majorUpdate() {
    if (this.food > 20) {
      this.food -= 20;
      this.addVillager();
    }
  }

  addVillager() {
    this.environment.objects.push(new Villager({
      context: this.context,
      environment: this.environment,
      home: this
    }))
  }
}
