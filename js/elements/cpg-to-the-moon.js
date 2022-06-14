import GravityBall from '../objects/gravity-ball.js';
import BaseElement from './base-element.js';
import { getDistance } from '../utility.js';
import Circle from '../objects/circle.js';

const speedAdjust = 0.15;
const massAdjust = 0.025;
const sizeAdjust = 1;
const thrust = 0.00000015 * speedAdjust;

export default class CpgToTheMoon extends BaseElement {
  constructor() {
    super();
    this.createProps(CpgToTheMoon.observedAttributes);
    this.configure({ fullScreen: true });
    this.parsec = this.canvas.width / 2;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    this.earthRadius = 20;
    this.earthMass = 20;
    this.fuel = 100;
    this.scaleFactor = 1;
    this.speed = 2;
    this.sun = new GravityBall({
      context: this.context,
      env: this,
      name: 'sun',
      x: 0,
      y: 0,
      dx: speedAdjust * 0,
      dy: speedAdjust * 0,
      mass: massAdjust * this.earthMass * 14,
      radius: sizeAdjust * this.earthRadius * 3,
      fillStyle: 'rgba(255, 255, 0, 1)',
    });
    this.earth = new GravityBall({
      context: this.context,
      env: this,
      name: 'earth',
      x: -3 * this.parsec,
      y: 0,
      dx: speedAdjust * 0,
      dy: speedAdjust * -0.34,
      mass: massAdjust * this.earthMass,
      radius: sizeAdjust * this.earthRadius,
      fillStyle: 'rgba(52, 190, 90, 1)',
    });
    this.moon = new GravityBall({
      context: this.context,
      env: this,
      name: 'moon',
      x: this.earth.x - (this.earthRadius * 5),
      y: this.earth.y,
      dx: this.earth.dx,
      dy: this.earth.dy - 0.08,
      mass: massAdjust * (this.earthMass / 6),
      radius: sizeAdjust * (this.earthRadius / 6),
      fillStyle: 'rgba(200, 200, 210, 1)',
    });
    this.rocket = new GravityBall({
      context: this.context,
      env: this,
      name: 'rocket',
      x: this.earth.x,
      y: this.earth.y - this.earthRadius - (this.earthRadius / 18),
      dx: this.earth.dx,
      dy: this.earth.dy,
      mass: massAdjust * this.earthMass / 1000000,
      radius: sizeAdjust * (this.earthRadius / 18),
      fillStyle: 'rgba(150, 150, 150, 1)',
      toughness: 1.5
    });
    this.mars = new GravityBall({
      context: this.context,
      env: this,
      name: 'mars',
      x: 0,
      y: this.parsec * 9,
      dx: speedAdjust * -0.23,
      dy: speedAdjust * 0,
      mass: massAdjust * this.earthMass / 2,
      radius: sizeAdjust * this.earthRadius / 2,
      fillStyle: 'rgba(255, 125, 0, 1)',
    });
    this.neptune = new GravityBall({
      context: this.context,
      env: this,
      name: 'neptune',
      x: this.centerX * 20,
      y: 0,
      dx: speedAdjust * 0,
      dy: speedAdjust * 0.115,
      mass: massAdjust * this.earthMass * 2,
      radius: sizeAdjust * this.earthRadius * 2,
      fillStyle: 'rgba(0, 0, 255, 1)',
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

    this.objs = [ this.sun, this.earth, this.moon, this.mars, this.neptune, this.rocket ];
    this.origin = this.earth;
    // TODO Scaling ruins thrust
    this.scale(6);
    // this.origin = this.sun;
    // this.scale(0.05);
    this.startAnimation();

    document.addEventListener('keydown', e => {
      if (e.key === '=' || e.key === '+') {
        this.scale(1.05);
      } else if (e.key === '-') {
        this.scale(0.95);
      } else if (e.key === '1') {
        this.speed = 1;
      } else if (e.key === '2') {
        this.speed = 2;
      } else if (e.key === '3') {
        this.speed = 3;
      } else if (e.key === '4') {
        this.speed = 5;
      } else if (e.key === '5') {
        this.speed = 10;
      } else if (e.key === '6') {
        this.speed = 15;
      } else if (e.key === '7') {
        this.speed = 25;
      } else if (e.key === '8') {
        this.speed = 50;
      } else if (e.key === '9') {
        this.speed = 200;
      } else if (e.key === '0') {
        this.speed = 0;
      } else if (e.key === 's') {
        this.origin = this.sun;
      } else if (e.key === 'e') {
        this.origin = this.earth;
      } else if (e.key === 'm') {
        this.origin = this.moon;
      } else if (e.key === 'a') {
        this.origin = this.mars;
      } else if (e.key === 'p') {
        this.origin = this.neptune;
      } else if (e.key === 'r' && this.rocket) {
        this.origin = this.rocket;
      } else if (e.key === 'n') {
        this.origin = undefined;
      } else if ((e.key === 'ArrowUp') && !this.rocket.broken && this.fuel > 0 && this.rocket) {
        console.log(this.scaleFactor);
        this.rocket.dy -= (thrust * this.speed * Math.pow(this.scaleFactor, 3)) / this.rocket.mass;
        this.useFuel();
      } else if (e.key === 'ArrowDown' && !this.rocket.broken && this.fuel > 0 && this.rocket) {
        this.rocket.dy += (thrust * this.speed * Math.pow(this.scaleFactor, 3)) / this.rocket.mass;
        this.useFuel();
      } else if (e.key === 'ArrowLeft' && !this.rocket.broken && this.fuel > 0 && this.rocket) {
        this.rocket.dx -= (thrust * this.speed * Math.pow(this.scaleFactor, 3)) / this.rocket.mass;
        this.useFuel();
      } else if (e.key === 'ArrowRight' && !this.rocket.broken && this.fuel > 0 && this.rocket) {
        this.rocket.dx += (thrust * this.speed * Math.pow(this.scaleFactor, 3)) / this.rocket.mass;
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
    for (var i = 0; i < this.speed; i++) {
      this.objs.forEach(obj => obj && obj.updateDelta());
      this.objs.forEach(obj => obj && obj.updateImpact());
      this.objs.forEach(obj => obj && obj.update());
      this.resetOrigin();
    }
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
    this.scaleFactor *= factor;
    const attrsToScale = [ 'x', 'y', 'dx', 'dy', 'radius', 'mass' ];
    attrsToScale.forEach(attr => this.objs.forEach(obj => {
      if (obj && ['mass'].includes(attr)) {
        // Why do we have to cube root the factor for mass???
        obj.mass = obj[attr] * factor * factor * factor;
      } else if (obj) {
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
