import { getMousePos } from '../utility.js';
import Grid from '../objects/grid.js';

export default class CpgGameOfLife extends HTMLElement {
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
    this.gap = 0;
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
    /* ---------------------- */
    /* Configuration options */
    /* --------------------- */
    this.size = parseInt(this.getAttribute('size')) || 100;
    this.cellSize = parseInt(this.getAttribute('cell-size')) || 10;
    this.speed = parseInt(this.getAttribute('speed')) || 1000;
    this.byStep = this.getAttribute('by-step') === 'true' || false;
    /* ---------------------- */

    // The two dimensional grid is imaged as each row being concatenated to make a single dimensional array.
    this.liveCells = new Array(this.size * this.size);


    this.fill(0, 0);
    this.fill(0, 2);
    this.fill(1, 1);
    this.fill(1, 2);
    this.fill(2, 1);

    this.grid = new Grid({
      context: this.context,
      cellSize: this.cellSize,
      width: this.size,
      height: this.size,
      filledCells: this.liveCellsByCoordinates
    });

    if (this.byStep) {
      window.addEventListener('keydown', e => {
        // Left arrow key
        if (e.keyCode == 39) {
          self.update();
        }
      });
    }

    this.canvas.addEventListener('click', event => {
      var mousePosition = getMousePos(this.canvas, event);
      let x = Math.floor(mousePosition.x / this.cellSize);
      let y = Math.floor(mousePosition.y / this.cellSize);
      // Why does this need to be backwards??
      this.fill(y, x);
      this.grid.filledCells = this.liveCellsByCoordinates;
    });

    var self = this;
    var lastUpdate = new Date().getTime();
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (self.active) {
        var now = new Date().getTime();
        self.doAnimate();
        if (! self.byStep && (now - lastUpdate > self.speed)) {
          lastUpdate = now;
          self.update();
        }
      }
    }

    animate();
  }

  get liveCellsByCoordinates() {
    return this.liveCells
      .map((live, index) => ({
        x: index % this.size,
        y: Math.floor(index / this.size),
        live: live
      }))
      .filter(cell => cell.live);
  }

  update() {
    let makeAliveIndexes = [ ];
    let makeDeadIndexes = [ ];

    for (let i = 0; i < this.size * this.size; i++) {
      let newState = this.newState(i);

      if (newState !== this.liveCells[i]) {
        if (newState) {
          makeAliveIndexes.push(i);
        } else {
          makeDeadIndexes.push(i);
        }
      }
    }

    makeDeadIndexes.forEach(index => this.liveCells[index] = false);
    makeAliveIndexes.forEach(index => this.liveCells[index] = true);

    this.grid.filledCells = this.liveCellsByCoordinates;
  }

  // Returns true if new state is alive or false if new state is dead.
  newState(index) {
    let livingNeighbors = 0;

    this.findNeigbors(index).forEach(neighbor => {
      if (this.liveCells[neighbor]) {
        livingNeighbors++;
      }
    });

    if (this.liveCells[index]) {
      // Living cells with 2 or 3 live neighbors stay alive.
      return livingNeighbors === 3 || livingNeighbors === 2;
    } else {
      // Dead cells with 3 live neighbors become alive.
      return livingNeighbors === 3;
    }
  }

  findNeigbors(index) {
    let neighbors = [];

    neighbors.push(index + 1);
    neighbors.push(index + this.size);
    neighbors.push(index + this.size + 1);
    neighbors.push(index + this.size - 1);

    // These have the chance of being negative
    if (index - this.size >= 0) neighbors.push(index - this.size);
    if (index - this.size + 1 >= 0) neighbors.push(index - this.size + 1);
    if (index - 1 >= 0) neighbors.push(index - 1);
    if (index - this.size - 1 >= 0) neighbors.push(index - this.size - 1);

    return neighbors;
  }

  fill(x, y) {
    this.liveCells[(x * this.size) + y] = true;
  }

  clear(x, y) {
    this.liveCells[(x * this.size) + y] = false;
  }

  doAnimate() {
    this.grid.update();
  }
}

customElements.define('cpg-game-of-life', CpgGameOfLife);
