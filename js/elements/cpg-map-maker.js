import HexGrid from '../objects/hex-grid.js';

export default class CpgMapMaker extends HTMLElement {
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

    var resizeTimer;
    window.onresize = () => {
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
    this.sideLength = parseInt(this.getAttribute('side-length')) || 50;
    this.gridSize = parseInt(this.getAttribute('grid-size')) || 3;
    this.dotSize = parseInt(this.getAttribute('dot-size')) || 5;
    this.hoverDotSize = parseInt(this.getAttribute('hover-dot-size')) || 5;
    this.dragDotSize = parseInt(this.getAttribute('drag-dot-size')) || 5;
    this.lineThickness = parseInt(this.getAttribute('line-thickness')) || 4;
    this.cornerRgba = this.getAttribute('corner-rgba') || 'rgba(0,0,0,1)';
    this.sideRgba = this.getAttribute('side-rgba') || 'rgba(0,0,0,1)';
    this.hoverRgba = this.getAttribute('hover-rgba') || 'rgba(0,150,0,1)';
    this.dragRgba = this.getAttribute('drag-rgba') || 'rgba(0,200,0,1)';
    this.showOrigin = this.getAttribute('show-origin') === 'true';
    /* ---------------------- */

    this.refreshGridSettings();

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

  refreshGridSettings() {
    this.hexGrid = new HexGrid({
      context: this.context,
      red: 0,
      green: 0,
      blue: 0,
      sideLength: this.sideLength,
      gridSize: this.gridSize,
      dotSize: this.dotSize,
      hoverDotSize: this.hoverDotSize,
      dragDotSize: this.dragDotSize,
      lineThickness: this.lineThickness,
      cornerRgba: this.cornerRgba,
      sideRgba: this.sideRgba,
      hoverRgba: this.hoverRgba,
      dragRgba: this.dragRgba,
      showOrigin: this.showOrigin,
    });
  }

  data() {
    return this.hexGrid.data();
  }

  doAnimate() {
    if (this.hexGrid) {
      this.hexGrid.update();
    }
  }
}

customElements.define('cpg-map-maker', CpgMapMaker);
