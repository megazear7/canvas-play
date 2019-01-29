import { getDistance } from '/js/utility.js';
import Ball from './ball.js';

export default class Bubble extends Ball {
  constructor(props) {
    super(props);
  }

  move() {
    super.move();

    this.dy += 0.1;
  }
}
