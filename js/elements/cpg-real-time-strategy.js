import RtsMap, { MOUNTAIN, WOODS } from '../objects/rts-map.js';

export default class CpgRealTimeStrategy extends HTMLElement {
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
          background-color: #84BE6A;
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
    this.active = true;
    this.cellSize = 20;
    this.cellsWide = this.canvas.width / this.cellSize;
    this.cellsTall = this.canvas.height / this.cellSize;
    this.map = new RtsMap({
      context: this.context,
      cellSize: this.cellSize,
      shiftX: Math.round(this.cellsWide / 2),
      shiftY: Math.round(this.cellsTall / 2),
    });
    this.map.addRegion(MOUNTAIN, 0, 0);
    this.map.addRegion(WOODS, 0, 0);
    this.map.addRegion(WOODS, 0, 0);
    this.map.addRegion(MOUNTAIN, 0, 0);
    this.map.addRegion(MOUNTAIN, 0, 0);
    this.map.addRegion(WOODS, 0, 0);

    var resizeTimer;
    window.onresize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cellsWide = this.canvas.width / this.cellSize;
        this.cellsTall = this.canvas.height / this.cellSize;
        this.map.shiftX = Math.round(this.cellsWide / 2);
        this.map.shiftY = Math.round(this.cellsTall / 2);
      }, 250);
    };
  }

  connectedCallback() {
    /* ---------------------- */
    /* Configuration options */
    /* --------------------- */
    this.gapSpeed = parseFloat(this.dataset.gapSpeed) || 0;
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
    this.map.update();
  }
}

customElements.define('cpg-real-time-strategy', CpgRealTimeStrategy);
