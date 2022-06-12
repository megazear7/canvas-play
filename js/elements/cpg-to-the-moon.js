import GravityBall from '../objects/gravity-ball.js';
import BaseElement from './base-element.js';
import { getDistance } from '../utility.js';

const thrust = 0.2;

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
      x: this.earthRadius * -2,
      y: 0,
      dx: 0,
      dy: -1.5,
      mass: this.earthMass / 6,
      radius: this.earthRadius / 6,
    });
    this.rocket = new GravityBall({
      context: this.context,
      name: 'rocket',
      x: 0,
      y: this.earthRadius * -1,
      dx: 0,
      dy: 0,
      mass: this.earthMass / 100,
      radius: this.earthRadius / 100,
    });
    this.objs = [ this.earth, this.moon, this.rocket ];
    this.origin = this.rocket;
    this.scale(5);
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
      } else if (e.key === 'r') {
        this.origin = this.rocket;
      } else if (e.key === 'ArrowUp') {
        this.rocket.dy -= thrust;
      } else if (e.key === 'ArrowDown') {
        this.rocket.dy += thrust;
      } else if (e.key === 'ArrowLeft') {
        this.rocket.dx -= thrust;
      } else if (e.key === 'ArrowRight') {
        this.rocket.dx += thrust;
      }
    })
  }

  update() {
    this.objs.forEach(obj => obj.updateDelta(this.objs));
    this.objs.forEach(obj => obj.updateImpact(this.objs));
    this.objs.forEach(obj => obj.update(this.objs));
    this.resetOrigin();
  }

  resetOrigin() {
    const distance = getDistance(this.origin.x, this.origin.y, this.centerX, this.centerY);  
    const angle = Math.atan2(this.origin.y - this.centerY, this.origin.x - this.centerX);
    const xDistance = Math.cos(angle) * distance;
    const yDistance = Math.sin(angle) * distance;

    this.objs.forEach(obj => {
      obj.x -= xDistance;
      obj.y -= yDistance;
    });
  }

  scale(factor) {
    const attrsToScale = [ 'x', 'y', 'radius', 'mass' ];
    attrsToScale.forEach(attr => this.objs.forEach(obj => obj[attr] *= factor));
  }

  animate() {
    this.objs.forEach(obj => obj.draw());
  }
}

customElements.define('cpg-to-the-moon', CpgToTheMoon);
