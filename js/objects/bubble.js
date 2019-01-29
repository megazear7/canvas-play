import { getDistance } from '/js/utility.js';
import Ball from './ball.js';

export default class Bubble extends Ball {
  constructor(props) {
    super(props);
    this.minRadius = props.minRadius;
    this.radius = this.minRadius;
  }

  draw(mousePosition) {
    if (mousePosition) {
      var distance = getDistance(mousePosition.x, mousePosition.y, this.x, this.y);
      this.radius = Math.max(100 - distance, this.minRadius);
    }
    super.draw();
  }

  update(mousePosition) {
    this.draw(mousePosition);
    this.move();
  }
}
