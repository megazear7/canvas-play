import { randomX, randomY, drawCircle, writeText, getDistancePts, movePoint, percentAdjust, drawRect2, isOffScreen } from '../utility.js';
import Villager, { HERO } from './villager.js';

export const HOME = 'home';
export const OUTPOST = 'OUTPOST';
export const BASE_MAX_AGE = 48000;
export const BASE_MAX_POP = 12;
export const BASE_HOME_SPEED = 100;
export const VILLAGER_BASE_ADVENTUROUSNESS = 0.2;
export const BASE_VILLAGER_MAX_SPEED = 0.48;
export const BASE_VILLAGER_AGILITY = 0.02;
export const BASE_VILLAGER_AGGRESIVENESS = 0.1;
export const BASE_VILLAGER_HEROISM = 0.01;
export const BASE_VILLAGER_STRENGTH = 7;
export const MUTATION_RATE = 0.2;
export const EXPANSION_RATE = 0.1;
export const STARTING_VARIABILITY = 0.5;

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
              adventurousness = VILLAGER_BASE_ADVENTUROUSNESS * percentAdjust(STARTING_VARIABILITY),
              startingMaxPopulation = BASE_MAX_POP * percentAdjust(STARTING_VARIABILITY),
              maxAge = BASE_MAX_AGE * percentAdjust(STARTING_VARIABILITY),
              homeSpeed = BASE_HOME_SPEED * percentAdjust(STARTING_VARIABILITY),
              villagerAgility = BASE_VILLAGER_AGILITY * percentAdjust(STARTING_VARIABILITY),
              villagerMaxSpeed = BASE_VILLAGER_MAX_SPEED * percentAdjust(STARTING_VARIABILITY),
              villagerAgressiveness = BASE_VILLAGER_AGGRESIVENESS * percentAdjust(STARTING_VARIABILITY),
              villagerStrength = BASE_VILLAGER_STRENGTH * percentAdjust(STARTING_VARIABILITY),
              villagerHeroism = BASE_VILLAGER_HEROISM * percentAdjust(STARTING_VARIABILITY),
              expansionRate = EXPANSION_RATE * percentAdjust(STARTING_VARIABILITY),
            } = {}) {
    this.villagers = [];
    this.heroTargets = [];
    this.heroes = [];
    this.outposts = [];
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
    this.startingMaxPopulation = startingMaxPopulation;
    this.maxAge = maxAge;
    this.homeSpeed = homeSpeed;
    this.villagerAgility = villagerAgility;
    this.villagerMaxSpeed = villagerMaxSpeed;
    this.villagerAgressiveness = villagerAgressiveness;
    this.villagerStrength = villagerStrength;
    this.villagerHeroism = villagerHeroism;
    this.expansionRate = expansionRate;
    this.environment.history.push(this.characteristics);
    window.localStorage.setItem('VILLAGE_HISTORY', JSON.stringify(this.environment.history));
  }

  get characteristics() {
    return {
      type: this.type,
      adventurousness: this.adventurousness,
      startingMaxPopulation: this.startingMaxPopulation,
      maxAge: this.maxAge,
      homeSpeed: this.homeSpeed,
      villagerAgility: this.villagerAgility,
      villagerMaxSpeed: this.villagerMaxSpeed,
      villagerMaxAcceleration: this.villagerMaxAcceleration,
      villagerCost: this.villagerCost
    };
  }

  get fullRadius() {
    return this.radius + this.villagers.length * 1.5;
  }

  get villagerCost() {
    return (
            ((1 * this.homeSpeed) / BASE_HOME_SPEED) +
            ((2 * this.villagerAgility) / BASE_VILLAGER_AGILITY) +
            ((9 * this.villagerMaxSpeed) / BASE_VILLAGER_MAX_SPEED) +
            ((4 * this.maxAge) / BASE_MAX_AGE) +
            ((2 * this.startingMaxPopulation) / BASE_MAX_POP) +
            ((3 * this.villagerStrength) / BASE_VILLAGER_STRENGTH)
           );
  }

  draw() {
    if (this.villagers.length > 0) {
      if (this.outposts.length > 0) {
        drawCircle({
          context: this.context,
          x: this.x,
          y: this.y,
          radius: this.distanceToFurthestOutpost,
          lineWidth: 0,
          lineStyle: `rgba(0,0,0,0)`,
          red: this.red,
          green: this.green,
          blue: this.blue,
          opacity: 0.5
        });
        this.outposts.forEach(outpost => {
          drawRect2({
            context: this.context,
            center: outpost,
            width: this.radius * 2,
            height: this.radius * 2,
            fillStyle: `rgba(${this.red},${this.green},${this.blue},1)`,
            lineStyle: `rgba(${this.red/3},${this.green/3},${this.blue/3},1)`,
            lineWidth: 1
          });
        });
      }
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

  get distanceToFurthestOutpost() {
    return this.outposts.length > 0 ? this.outposts
      .map(outpost => getDistancePts(this, outpost))
      .sort((a,b) => b - a)[0] : 0;
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

  get maxPopulation() {
    return this.startingMaxPopulation + (this.outposts.length * 3);
  }

  majorUpdate() {
    if (this.food > this.villagerCost) {
      this.food -= this.villagerCost;
      this.addVillager();
    }
    if (this.villagers.length === 0) {
      this.destroy = true;
    }
    if (this.villagers.filter(obj => obj.subType !== HERO).length > this.maxPopulation) {
      if (this.outposts.length > 0 || Math.random() < this.expansionRate) {
        this.buildOutpost();
      } else {
        this.splitVillage();
      }
    }
  }

  isParentOf(obj) {
    return obj.type === HOME && obj.parent && obj.parent.id === this.id;
  }

  splitVillage() {
    const newHome = this.environment.addHome();
    newHome.x = this.x;
    newHome.y = this.y;
    newHome.adventurousness = this.adventurousness * percentAdjust(MUTATION_RATE)
    newHome.startingMaxPopulation = this.startingMaxPopulation * percentAdjust(MUTATION_RATE)
    newHome.maxAge = this.maxAge * percentAdjust(MUTATION_RATE)
    newHome.homeSpeed = this.homeSpeed * percentAdjust(MUTATION_RATE)
    newHome.villagerAgility = this.villagerAgility * percentAdjust(MUTATION_RATE)
    newHome.villagerMaxSpeed = this.villagerMaxSpeed * percentAdjust(MUTATION_RATE)
    newHome.villagerStrength = this.villagerStrength * percentAdjust(MUTATION_RATE)
    newHome.villagerAgressiveness = this.villagerAgressiveness * percentAdjust(MUTATION_RATE)
    newHome.villagerHeroism = this.villagerHeroism * percentAdjust(MUTATION_RATE)
    newHome.expansionRate = this.expansionRate * percentAdjust(MUTATION_RATE)
    newHome.parent = this;
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

  buildOutpost() {
    let spot = this.findSpot();
    while (isOffScreen(this.environment.canvas, spot)) {
      spot = this.findSpot();
    }
    this.outposts.push({
      x: spot.x,
      y: spot.y,
      type: HOME,
      id: this.id,
      subType: OUTPOST,
      radius: this.radius
    });
  }

  findSpot() {
    const minDistance = this.distanceToFurthestOutpost
    ? this.distanceToFurthestOutpost
    : 100;
    const extraXDistance = Math.random() * this.adventurousness * 100;
    const extraYDistance = Math.random() * this.adventurousness * 100;
    const xTranslate = (minDistance + extraXDistance) * (Math.random() > 0.5 ? 1 : -1);
    const yTranslate = (minDistance + extraYDistance) * (Math.random() > 0.5 ? 1 : -1);
    return {
      x: this.x + xTranslate,
      y: this.y + yTranslate
    }
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
    return villager;
  }
}
