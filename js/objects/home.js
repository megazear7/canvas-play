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
              radius = 18,
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
    this.villagers = [];
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

  get fullRadius() {
    return this.radius + (this.villagers.length / 2);
  }

  draw() {
    if (this.villagers.length > 0) {
      drawCircle({
        context: this.context,
        x: this.x,
        y: this.y,
        radius: this.fullRadius,
        lineWidth: 1,
        red: this.red,
        green: this.green,
        blue: this.blue
      });
      writeText({
        context: this.context,
        text: parseInt(this.food),
        x: this.x,
        y: this.y
      });
    }
  }

  update() {
    this.draw();
  }

  minorUpdate() {
    this.villagers = this.villagers.filter(villager => !villager.destroy);
  }

  majorUpdate() {
    if (this.food > 20) {
      this.food -= 20;
      this.addVillager();
    }
    if (this.villagers.length === 0) {
      this.destroy = true;
    }
    if (this.villagers.length > 10) {
      this.splitVillage();
    }
  }

  splitVillage() {
    const newHome = this.environment.addHome();
    this.villagers.forEach((villager, count) => {
      if (count % 2 === 1) {
        villager.migrateToNewHome(newHome);
      }
    });
    this.villagers = this.villagers.filter(villager => villager.home.id === this.id);
  }

  addVillager() {
    const villager = new Villager({
      context: this.context,
      environment: this.environment,
      home: this
    });
    this.environment.objects.push(villager);
    this.villagers.push(villager);
  }
}
