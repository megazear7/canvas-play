import { getDistance } from '/js/utility.js';
import Ball from './ball.js';

export default class Bubble extends Ball {
  constructor(props) {
    super(props);
    this.radius = 20;
  }

  draw(mousePosition) {
    if (mousePosition) {
      var distance = getDistance(mousePosition.x, mousePosition.y, this.x, this.y);
      this.radius = Math.max(100 - distance, 10);
    }
    super.draw();
  }

  update(mousePosition) {
    this.draw(mousePosition);
    this.move();
  }
}
