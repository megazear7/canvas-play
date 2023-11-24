import { randomX, randomY, drawRect, shuffle, writeText, percentAdjust } from '../utility.js';
import { movePoint2, getDistancePts } from '../utility.js';
import { HERO, VILLAGER } from './villager.js';

export const BANDIT = 'bandit';
const BANDIT_MAX_SPEED = 0.2;
const BANDIT_AGILITY = 0.01;
const BANDIT_BASE_GIVE_UP_DISTANCE = 1;
const EXPLORE = 'EXPLORE';
export const MUTATION_RATE = 0.05;
export const STARTING_VARIABILITY = 0.25;

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
              maxSpeed = BANDIT_MAX_SPEED * percentAdjust(STARTING_VARIABILITY),
              agility = BANDIT_AGILITY * percentAdjust(STARTING_VARIABILITY),
              giveUp = BANDIT_BASE_GIVE_UP_DISTANCE * percentAdjust(STARTING_VARIABILITY)
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
    this.giveUp = giveUp;
    this.impacting = false;
    this.type = BANDIT;
    this.maxAge = 10000 + (Math.random() * 20000);
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
      // TODO: Uncomment this to see the destination drawn on the screen
      // if (this.destination) {
      //   drawArc({
      //     context: this.context,
      //     x: this.destination.x,
      //     y: this.destination.y,
      //     radius: 5,
      //     lineWidth: 0.5,
      //     lineStyle: `rgb(0,0,0)`
      //   });
      //   drawLine(
      //     this.context,
      //     this,
      //     this.destination,
      //     2,
      //     'rgb(0,0,0)'
      //   )
      // }
    }
  }

  get timeRemaining() {
    return this.death - Date.now();
  }

  get alive() {
    return this.timeRemaining > 0;
  }

  get giveUpDistance() {
    return (this.environment.canvas.width * this.environment.canvas.height * this.giveUp) / (75 * 75);
  }

  get radius() {
    return this.size;
  }

  move() {
    if (this.reachedVillager()) {
      this.killVillager();
    } else if (this.reachedExploreDestination()) {
      this.lookForNearbyVillagerOrExplore();
    } else if (this.hasNearbyVillager()) {
      this.moveToDestination();
    } else if (this.isExploring()) {
      this.lookForNearbyVillager();
      this.moveToDestination();
    } else {
      this.lookForNearbyVillagerOrExplore();
    }
  }

  lookForNearbyVillagerOrExplore() {
    const foundVillager = this.getNearbyVillager();
    if (foundVillager) {
      this.destination = foundVillager;
    } else {
      this.destination = {
        x: randomX(),
        y: randomY(),
        type: EXPLORE,
        radius: 1
      };
    }
  }

  getNearbyVillager() {
    let foundVillager = undefined;
    if (this.grids && Math.random()) {
      this.grids.forEach((grid, index) => {
        if (!foundVillager) {
          const objs = this.environment.grids[index].rows[grid.row][grid.col] || [];
          foundVillager = this.findTargetFromList(objs);
        }
      });
    }
    if (!foundVillager) {
      foundVillager = this.findTargetFromList(this.environment.objects);
    }
    return foundVillager;
  }

  lookForNearbyVillager() {
    const foundVillager = this.getNearbyVillager();
    if (foundVillager) {
      this.destination = foundVillager;
    }
  }

  isExploring() {
    return this.destination && this.destination.type === EXPLORE;
  }

  targetIsClose() {
    return getDistancePts(this, this.destination) < this.giveUpDistance;
  }
  
  hasNearbyVillager() {
    return this.destination && this.destination.type === VILLAGER && !this.destination.destroy && this.targetIsClose();
  }

  reachedExploreDestination() {
    return this.reachedTarget() && this.destination.type === EXPLORE;
  }

  reachedVillager() {
    return this.reachedTarget() && this.destination.type === VILLAGER && !this.destination.destroy;
  }

  reachedTarget() {
    return this.destination && getDistancePts(this, this.destination) < 1 + this.destination.radius;
  }

  killVillager() {
    const extraTime = this.destination.timeRemaining * 0.25;
    if (this.timeRemaining + extraTime > 100 * 1000) {
      this.destination.destroy = true;
      this.destination = undefined;
      this.spawn(extraTime);
    } else {
      this.death += extraTime;
      this.destination.home.heroTargets.push(this);
      this.destination.destroy = true;
      this.destination = undefined;
    }
  }

  spawn(extraTime) {
    const bandit = this.environment.addBandit();
    bandit.maxSpeed = this.maxSpeed * percentAdjust(MUTATION_RATE);
    bandit.agility = this.agility * percentAdjust(MUTATION_RATE);
    bandit.giveUp = this.giveUp * percentAdjust(MUTATION_RATE);
    bandit.x = this.x;
    bandit.y = this.y;
    bandit.maxAge = extraTime;
    bandit.death = Date.now() + extraTime;
    this.death = Date.now() + (this.timeRemaining / 2);
  }

  findTargetFromList(objects) {
    return shuffle(objects).find(obj =>
      obj.type === VILLAGER &&
      obj.subType !== HERO &&
      !obj.destroy &&
      getDistancePts(this, obj) <= this.giveUpDistance
    );
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
