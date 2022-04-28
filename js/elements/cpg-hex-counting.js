import HexGrid from '../objects/hex-grid.js';

export default class CpgHexCounting extends HTMLElement {
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
          z-index: 1000;
        }
      </style>
      <canvas></canvas>
    `;

    this.canvas = this.shadow.querySelector('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext('2d');
    this.gap = 0;
    this.active = true;

    this.hexGrid = new HexGrid({
      context: this.context,
      red: 0,
      green: 0,
      blue: 0,
      sideLength: 70,
      gridSize: 30,
    });

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
    /* ---------------------- */
    /* Configuration options */
    /* --------------------- */
    // TODO
    /* ---------------------- */

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (self.active) {
        self.doAnimate();
      }
    }

    animate();
  }

  doAnimate() {
    this.hexGrid.update();
  }
}

customElements.define('cpg-hex-counting', CpgHexCounting);
