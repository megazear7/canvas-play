import { randomX, randomY, drawCircle, writeText, getDistancePts, movePoint, percentAdjust, randomNumber } from '../utility.js';
import Villager from './villager.js';
export const HOME = 'home';

const BASE_MIN_AGE = 12000;
const BASE_MAX_AGE = 24000;
const BASE_MIN_POP = 5;
const BASE_MAX_POP = 10;
const BASE_HOME_SPEED = 100;
const VILLAGER_BASE_ADVENTUROUSNESS = 0.25;
const BASE_VILLAGER_MAX_SPEED = 1;
const BASE_VILLAGER_AGILITY = 0.04;

export default class Home {
  constructor({
              context,
              environment,
              x = randomX(),
              y = randomY(),
              red = 50,
              green = 50,
              blue = 50,
              radius = 15,
              food = 0,
              adventurousness = VILLAGER_BASE_ADVENTUROUSNESS * percentAdjust(0.3),
              maxPopulation = randomNumber({ min: BASE_MIN_POP, max: BASE_MAX_POP }) * percentAdjust(0.3),
              maxAge = randomNumber({ min: BASE_MIN_AGE, max: BASE_MAX_AGE }) * percentAdjust(0.3),
              homeSpeed = BASE_HOME_SPEED * percentAdjust(0.3),
              villagerAgility = BASE_VILLAGER_AGILITY * percentAdjust(0.3),
              villagerMaxSpeed = BASE_VILLAGER_MAX_SPEED * percentAdjust(0.3),
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
    this.adventurousness = adventurousness;
    this.maxPopulation = maxPopulation;
    this.maxAge = maxAge;
    this.homeSpeed = homeSpeed;
    this.villagerAgility = villagerAgility;
    this.villagerMaxSpeed = villagerMaxSpeed;
    this.villagers = [];
    this.environment.history.push(this.characteristics);
    window.localStorage.setItem('VILLAGE_HISTORY', JSON.stringify(this.environment.history));
  }

  get characteristics() {
    return {
      type: this.type,
      adventurousness: this.adventurousness,
      maxPopulation: this.maxPopulation,
      maxAge: this.maxAge,
      homeSpeed: this.homeSpeed,
      villagerAgility: this.villagerAgility,
      villagerMaxSpeed: this.villagerMaxSpeed,
      villagerMaxAcceleration: this.villagerMaxAcceleration,
      villagerCost: this.villagerCost
    };
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
    return this.radius + this.villagers.length * 1.5;
  }

  get villagerCost() {
    return (
            (this.homeSpeed / BASE_HOME_SPEED) +
            (this.villagerAgility / BASE_VILLAGER_AGILITY) +
            (this.villagerMaxSpeed / BASE_VILLAGER_MAX_SPEED) +
            (this.maxAge / BASE_MAX_AGE) +
            (this.maxPopulation / BASE_MAX_POP)
           )
           * 5;
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
        y: this.y,
      });
    }
  }

  moveToDestination() {
    const p = movePoint(this, this, this.destination, this.homeSpeed);
    this.x = p.x;
    this.y = p.y;
  }

  move() {
    if (this.destination && getDistancePts(this, this.destination) > this.radius) {
      this.moveToDestination();
    } else {
      this.destination = undefined;
    }
  }

  update() {
    this.draw();
    this.move();
  }

  minorUpdate() {
    this.villagers = this.villagers.filter(villager => !villager.destroy);
  }

  majorUpdate() {
    if (this.food > this.villagerCost) {
      this.food -= this.villagerCost;
      this.addVillager();
    }
    if (this.villagers.length === 0) {
      this.destroy = true;
    }
    if (this.villagers.length > this.maxPopulation) {
      this.splitVillage();
    }
  }

  splitVillage() {
    const newHome = this.environment.addHome();
    newHome.x = this.x;
    newHome.y = this.y;
    newHome.adventurousness = this.adventurousness * percentAdjust(0.1);
    newHome.maxPopulation = this.maxPopulation * percentAdjust(0.1);
    newHome.maxAge = this.maxAge * percentAdjust(0.1);
    newHome.homeSpeed = this.homeSpeed * percentAdjust(0.1);
    newHome.villagerAgility = this.villagerAgility * percentAdjust(0.1);
    newHome.villagerMaxSpeed = this.villagerMaxSpeed * percentAdjust(0.1);
    newHome.destination = {
      x: randomX(),
      y: randomY()
    };
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
    this.environment.placeObjInGrid(villager);
  }
}
