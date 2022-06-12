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
    this.earthRadius = 20;
    this.earthMass = 60;
    this.earth = new GravityBall({
      context: this.context,
      name: 'earth',
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      mass: this.earthMass,
      radius: this.earthRadius,
    });
    this.moon = new GravityBall({
      context: this.context,
      name: 'moon',
      x: 0,
      y: this.earthRadius * -2,
      dx: 1.5,
      dy: 0,
      mass: this.earthMass / 6,
      radius: this.earthRadius / 6,
    });
    this.objs = [ this.earth, this.moon ];
    this.origin = this.earth;
    this.startAnimation();

    document.addEventListener('keydown', e => {
      if (e.key === '=' || e.key === '+') {
        this.scale(1.05);
      } else if (e.key === '-') {
        this.scale(0.95);
      } else if (e.key === 'e') {
        this.origin = this.earth;
      } else if (e.key === 'm') {
        this.origin = this.moon;
      }
    })
  }

  update() {
    this.earth.updateDelta(this.objs);
    this.moon.updateDelta(this.objs);

    this.earth.updateImpact(this.objs);
    this.moon.updateImpact(this.objs);

    this.earth.update(this.objs);
    this.moon.update(this.objs);

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

  scale(factor) {
    const attrsToScale = [ 'x', 'y', 'radius', 'mass' ];
    const objs = [ this.earth, this.moon ];
    attrsToScale.forEach(attr => objs.forEach(obj => obj[attr] *= factor));
  }

  animate() {
    this.earth.draw();
    this.moon.draw();
  }
}

customElements.define('cpg-to-the-moon', CpgToTheMoon);
