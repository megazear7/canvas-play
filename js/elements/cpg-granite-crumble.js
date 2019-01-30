import Crack from '/js/objects/crack.js';

export default class CpgGraniteCrumble extends HTMLElement {
  constructor() {
    super();

    /* Configuration options */
    /* --------------------- */
    this.crackCount = parseInt(this.getAttribute('crack-count')) || window.innerWidth / 25;
    this.size = parseFloat(this.getAttribute('size')) || 50;
    this.speed = parseFloat(this.getAttribute('speed')) || 0.01;
    this.acceleration = parseFloat(this.getAttribute('acceleration')) || 0.01;
    this.opacity = parseFloat(this.getAttribute('opacity')) || 0.5;
    this.animationLength = parseFloat(this.getAttribute('animation-length')) || 1500;
    /* --------------------- */

    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style>
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1000;
        }
      </style>
      <canvas></canvas>
    `;

    this.canvas = this.shadow.querySelector('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext('2d');
    this.cracks = [];

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
    for (var i = 0; i < this.crackCount; i++) {
      this.cracks.push(new Crack({
        context: this.context,
        segmentCount: 1,
        breakSize: this.size,
        breakSpeed: this.speed,
        breakAcceleration: this.acceleration,
        opacity: this.opacity
      }));
    }

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();

    setTimeout(() => {
      this.cracks.forEach(crack => {
        crack.doUpdate = false;
      });
    }, this.animationLength);
  }

  doAnimate() {
    this.cracks.forEach(crack => crack.update());
  }
}

customElements.define('cpg-granite-crumble', CpgGraniteCrumble);
