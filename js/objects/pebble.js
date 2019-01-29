import { getDistance } from '/js/utility.js';
import Ball from './ball.js';

export default class Bubble extends Ball {
  constructor(props) {
    super(props);
    this.weight = props.weight || 1;
    this.energyLoss = this.weight;
    this.absoluteEnergyLoss = this.weight;
  }

  move() {
    super.move();

    this.dy += 0.1;
  }

  impactedWall() {
    this.dy = this.dy * (1- this.energyLoss) + this.absoluteEnergyLoss;
    this.dx = this.dx * (1- this.energyLoss);
  }
}
