import GravityBall from '../objects/gravity-ball.js';
import BaseElement from './base-element.js';
import { getDistance } from '../utility.js';

const SCALE = 100;

export default class CpgToTheMoon extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgToTheMoon.observedAttributes);
    this.configure({ fullScreen: true });
    this.earth = new GravityBall({
      context: this.context,
      x: this.canvas.width / 2,
      y: this.canvas.height,
      dx: 0,
      dy: 0,
      mass: 6,
      radius: SCALE,
    });
    this.moon = new GravityBall({
      context: this.context,
      x: this.canvas.width / 2,
      y: 50,
      dx: 1,
      dy: 0,
      mass: 1,
      radius: SCALE / 6,
    });
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
    const distance = getDistance(this.earth.x, this.earth.y, this.canvas.width / 2, this.canvas.height);  
    const angle = Math.atan2(this.earth.y - this.canvas.height, this.earth.x - this.canvas.width / 2);
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
