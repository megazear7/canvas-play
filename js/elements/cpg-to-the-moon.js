import GravityBall from '../objects/gravity-ball.js';
import BaseElement from './base-element.js';

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
      dx: 0,
      dy: 0,
      mass: 1,
      radius: SCALE / 6,
    });
    this.startAnimation();
  }

  update() {
    this.earth.updateDelta([this.moon], 'earth');
    this.moon.updateDelta([this.earth], 'moon');

    this.earth.update();
    this.moon.update();
  }

  animate() {
    this.earth.draw();
    this.moon.draw();
  }
}

customElements.define('cpg-to-the-moon', CpgToTheMoon);
