import Pebble from '/js/objects/pebble.js';

export default class CpgFallingPebbles extends HTMLElement {
  constructor() {
    super();

    /* Configuration options */
    /* --------------------- */
    this.pebbleCount = parseInt(this.getAttribute('pebble-count')) || 100;
    this.speed = parseFloat(this.getAttribute('speed')) || 0.5;
    this.weight = parseFloat(this.getAttribute('weight')) || 0.3;
    this.minSize = parseFloat(this.getAttribute('min-size')) || 5.0;
    this.maxSize = parseFloat(this.getAttribute('max-size')) || 15.0;
    /* --------------------- */

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
    this.pebbles = [];

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
    for (var i = 0; i < this.pebbleCount; i++) {
      this.pebbles.push(new Pebble({
        context: this.context,
        speed: this.speed,
        weight: this.weight,
        radius: (Math.random() * this.maxSize - this.minSize) + this.minSize
      }));
    }

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();
  }

  doAnimate() {
    this.pebbles.forEach(pebble => pebble.update());
  }
}

customElements.define('cpg-falling-pebbles', CpgFallingPebbles);
