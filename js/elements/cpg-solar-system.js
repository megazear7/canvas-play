import { getMousePos, movePoint } from '/js/utility.js';
import StellarObject from '/js/objects/stellar-object.js';

export default class CpgSolarSystem extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style>
        :host {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
        }

        canvas {
          position: absolute;
          top: 0;
          left: 0;
        }
      </style>
      <canvas></canvas>
    `;

    this.canvas = this.shadow.querySelector('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext('2d');
    this.active = true;

    var resizeTimer;
    window.onresize = event => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }, 250);
    };
  }

  connectedCallback() {
    this.particles = [ ];

    this.particles.push(new StellarObject({
      context: this.context,
      stellarObjects: this.particles,
      x: this.canvas.width / 2,
      y: this.canvas.height / 6,
      dx: 2,
      dy: 0,
      mass: 10
    }));

    this.particles.push(new StellarObject({
      context: this.context,
      stellarObjects: this.particles,
      x: this.canvas.width / 2,
      y: this.canvas.height / 3,
      dx: 1,
      dy: 0,
      mass: 3
    }));

    this.particles.push(new StellarObject({
      context: this.context,
      stellarObjects: this.particles,
      x: this.canvas.width / 4,
      y: this.canvas.height / 2,
      dx: 0,
      dy: -3,
      mass: 2
    }));

    this.particles.push(new StellarObject({
      context: this.context,
      stellarObjects: this.particles,
      x: this.canvas.width / 2,
      y: this.canvas.height * ( 3 / 4),
      dx: -1,
      dy: 0,
      mass: 20
    }));

    this.particles.push(new StellarObject({
      context: this.context,
      stellarObjects: this.particles,
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      dx: 0,
      dy: 0,
      mass: 1000
    }));

    /* ---------------------- */
    /* Configuration Options */
    /* ---------------------- */
    this.href = this.getAttribute('href');
    this.sizeMultiplier = this.getFloatAttr('size-multiplier', 1) * 2;
    this.opacity = this.getFloatAttr('opacity', 1);
    this.friction = this.getFloatAttr('friction', 1) * 0.9;
    this.speed = this.getFloatAttr('speed', 1) * 20;
    /* ---------------------- */

    this.beginScene();
  }

  beginScene() {
    var animate;
    var self = this;
    animate = () => {
      requestAnimationFrame(animate);
      if (self.active) {
        self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.doAnimate();
      }
    }
    animate();
  }

  doAnimate() {
    this.update();
    this.draw();
  }

  update() {
    this.particles.forEach(particle => {
    });
  }

  draw() {
    this.particles.forEach(particle => {
      particle.update();
    });
  }

  getFloatAttr(name, defaultVal) {
    if (this.hasAttribute(name)) {
      return parseFloat(this.getAttribute(name));
    } else {
      return defaultVal;
    }
  }
}

customElements.define('cpg-solar-system', CpgSolarSystem);
