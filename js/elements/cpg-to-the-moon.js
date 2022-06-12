import GravityBall from '../objects/gravity-ball.js';
import BaseElement from './base-element.js';
import { getDistance } from '../utility.js';

const SCALE = 200;

export default class CpgToTheMoon extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgToTheMoon.observedAttributes);
    this.configure({ fullScreen: true });
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.earth = new GravityBall({
      context: this.context,
      x: this.centerX,
      y: this.centerY,
      dx: 0,
      dy: 0,
      mass: 6,
      radius: SCALE,
    });
    this.moon = new GravityBall({
      context: this.context,
      x: this.centerX,
      y: this.centerY / 5,
      dx: 1.5,
      dy: 0,
      mass: 1,
      radius: SCALE / 6,
    });
    this.origin = this.earth;
    this.startAnimation();
  }

  update() {
    this.earth.updateDelta([this.moon]);
    this.moon.updateDelta([this.earth]);

    this.earth.updateImpact([this.moon]);
    this.moon.updateImpact([this.earth]);

    this.earth.update([this.moon]);
    this.moon.update([this.earth]);

    this.resetOrigin();
  }

  resetOrigin() {
    const distance = getDistance(this.origin.x, this.origin.y, this.centerX, this.centerY);  
    const angle = Math.atan2(this.origin.y - this.centerY, this.origin.x - this.centerX);
    const xDistance = Math.cos(angle) * distance;
    const yDistance = Math.sin(angle) * distance;

    this.earth.x -= xDistance;
    this.earth.y -= yDistance;
    this.moon.x -= xDistance;
    this.moon.y -= yDistance;
  }

  animate() {
    this.earth.draw();
    this.moon.draw();
  }
}

customElements.define('cpg-to-the-moon', CpgToTheMoon);
