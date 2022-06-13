import GravityBall from '../objects/gravity-ball.js';
import BaseElement from './base-element.js';
import { getDistance } from '../utility.js';
import Circle from '../objects/circle.js';

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
    this.fuel = 100;
    this.earth = new GravityBall({
      context: this.context,
      name: 'earth',
      x: this.centerX,
      y: this.centerY,
      dx: 0,
      dy: 0,
      mass: this.earthMass,
      radius: this.earthRadius,
      fillStyle: 'rgba(52, 190, 90, 1)',
    });
    // this.moon = new GravityBall({
    //   context: this.context,
    //   name: 'moon',
    //   x: this.centerX + (this.earthRadius * -2),
    //   y: this.centerY,
    //   dx: 0,
    //   dy: -1.3,
    //   mass: this.earthMass / 6,
    //   radius: this.earthRadius / 6,
    //   fillStyle: 'rgba(200, 200, 210, 1)',
    // });
    this.rocket = new GravityBall({
      context: this.context,
      name: 'rocket',
      x: this.centerX,
      y: this.centerY + (this.earthRadius * -1),
      dx: 0,
      dy: 0,
      mass: this.earthMass / 100,
      radius: this.earthRadius / 25,
      fillStyle: 'rgba(150, 150, 150, 1)',
    });
    this.stars = [];

    for (var i = 0; i < (Math.random() * 1000) + 500; i++) {
      this.stars.push(new Circle({
        context: this.context,
        fillStyle: `rgba(255, 255, 255, ${(Math.random() * 0.5) + 0.5})`,
        radius: Math.random() * 2,
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
      }))
    }

    this.objs = [ this.earth, this.moon, this.rocket ];
    this.origin = this.earth;
    this.scale(3);
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
      } else if (e.key === 'r' && this.rocket) {
        this.origin = this.rocket;
      } else if (e.key === 'n') {
        this.origin = undefined;
      } else if (e.key === 'ArrowUp' && this.fuel > 0 && this.rocket) {
        this.rocket.dy -= thrust;
        this.useFuel();
      } else if (e.key === 'ArrowDown' && this.fuel > 0 && this.rocket) {
        this.rocket.dy += thrust;
        this.useFuel();
      } else if (e.key === 'ArrowLeft' && this.fuel > 0 && this.rocket) {
        this.rocket.dx -= thrust;
        this.useFuel();
      } else if (e.key === 'ArrowRight' && this.fuel > 0 && this.rocket) {
        this.rocket.dx += thrust;
        this.useFuel();
      }
    })
  }

  useFuel() {
    this.fuel -= 1;
    this.dispatchEvent(new CustomEvent('use-fuel', { detail: { fuel: this.fuel }}));

    if (this.fuel <= 0) {
      this.rocket.fillStyle = 'rgba(0,0,255,1)';
    }
  }

  update() {
    this.objs.forEach(obj => obj && obj.updateDelta(this.objs));
    this.objs.forEach(obj => obj && obj.updateImpact(this.objs));
    this.objs.forEach(obj => obj && obj.update(this.objs));
    this.resetOrigin();
  }

  resetOrigin() {
    if (this.origin) {
      const distance = getDistance(this.origin.x, this.origin.y, this.centerX, this.centerY);  
      const angle = Math.atan2(this.origin.y - this.centerY, this.origin.x - this.centerX);
      const xDistance = Math.cos(angle) * distance;
      const yDistance = Math.sin(angle) * distance;
      this.objs.forEach(obj => {
        if (obj) {
          obj.x -= xDistance;
          obj.y -= yDistance;
        }
      });
    }
  }

  scale(factor) {
    // I need to scale dx and dy, but it throws off the strength of gravity
    const attrsToScale = [ 'x', 'y', 'radius', 'mass' ];
    attrsToScale.forEach(attr => this.objs.forEach(obj => {
      if (obj) {
        obj[attr] *= factor
      }
    }));
  }

  animate() {
    this.stars.forEach(star => star.draw());
    this.objs.forEach(obj => obj && obj.draw());
  }
}

customElements.define('cpg-to-the-moon', CpgToTheMoon);
