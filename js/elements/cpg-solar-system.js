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
    this.maxObjectCount = 10;
    this.particles = [ ];

    for (var i = 0; i < this.maxObjectCount; i++) {
      let objectAttr = this.getAttribute('object-' + (i+1))
      if (objectAttr) {
        let objectConfig = objectAttr.split(/\s+/);
        this.particles.push(new StellarObject({
          context: this.context,
          stellarObjects: this.particles,
          x: this.canvas.width * (parseFloat(objectConfig[0]) / 100),
          y: this.canvas.height * (parseFloat(objectConfig[1]) / 100),
          dx: parseFloat(objectConfig[2]),
          dy: parseFloat(objectConfig[3]),
          mass: parseFloat(objectConfig[4])
        }));
      }
    }

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
