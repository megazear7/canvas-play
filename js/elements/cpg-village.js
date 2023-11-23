import { VILLAGER } from '/js/objects/villager.js';
import Bandit from '/js/objects/bandit.js';
import  Apple, { APPLE } from '/js/objects/apple.js';
import Home, { HOME } from '/js/objects/home.js';
import { randomNumber, randomX } from '../utility.js';
import { ROTTEN_APPLE } from '../objects/apple.js';
import { BANDIT } from '../objects/bandit.js';

export default class CpgVillage extends HTMLElement {
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
    this.objects = [];

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
    this.appleDensity = parseFloat(this.getAttribute('apple-density')) || 1;
    this.appleValue = parseFloat(this.getAttribute('apple-value')) || 1;
    this.villagerDensity = parseFloat(this.getAttribute('villager-density')) || 1;
    this.updateDelay = parseFloat(this.getAttribute('update-delay')) || 1;
    this.appleAgeRate = parseFloat(this.getAttribute('apple-age-rate')) || 1;
    this.banditDensity = parseFloat(this.getAttribute('bandit-density')) || 1;
    this.midGameStart = parseFloat(this.getAttribute('bandit-density')) || 20000;
    this.villages = parseFloat(this.getAttribute('villages')) || 3;
    /* --------------------- */

    this.startAppleDensity = this.appleDensity;
    this.midGame = false;
    this.history = [];
    this.rowSize = 20;
    this.colSize = 20;
    this.gridCount = 5;
    this.startTime = Date.now();
    this.makeGrids();
    this.addStartingApples();
    this.addStartingVillages();
    this.addBandits();

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();
    setInterval(() => this.majorUpdates(), this.updateDelay * 1000);
    setInterval(() => this.minorUpdates(), this.updateDelay * 100);
  }

  majorUpdates() {
    this.makeGrids();
    this.placeAllObjects();
    this.objects.forEach(obj => obj.majorUpdate());
    this.addApples();
    this.addBandits();
    this.adjustMaxApples();
  }

  adjustMaxApples() {
    if (this.villagers.length > this.maxVillagers && this.appleDensity < this.startAppleDensity * 2) {
      this.appleDensity = this.appleDensity * 0.995;
    } else if (this.villagers.length < this.maxVillagers && this.appleDensity > this.startAppleDensity * 0.5) {
      this.appleDensity = this.appleDensity * 1.005;
    }
  }

  minorUpdates() {
    this.objects = this.objects.filter(obj => !obj.destroy);
    this.objects.forEach(obj => obj.minorUpdate());
  }

  makeGrids() {
    let rowSize = this.rowSize;
    let colSize = this.colSize;
    this.grids = [];
    while (rowSize < this.canvas.height || colSize < this.canvas.width) {
      const i = this.grids.length;
      const rowCount = Math.ceil(this.canvas.height / rowSize);
      const colCount = Math.ceil(this.canvas.width / colSize);
      this.grids[i] = {
        rows: [],
        rowSize: rowSize,
        colSize: colSize
      };
      for (let j = 0; j < rowCount; j++) {
        this.grids[i].rows[j] = [];
        for (let k = 0; k < colCount; k++) {
          this.grids[i].rows[j][k] = [];
        }
      }
      rowSize = rowSize * 2;
      colSize = colSize * 2;
    }
  }

  placeAllObjects() {
    this.objects.forEach(obj => this.placeObjInGrid(obj));
  }

  placeObjInGrid(obj) {
    obj.grids = [];
    this.grids.forEach((grid, index) => {
      const col = Math.floor(obj.x / grid.colSize);
      const row = Math.floor(obj.y / grid.rowSize);
      if (grid && grid.rows[row] && grid.rows[row][col] && grid.rows[row][col].length >= 0) {
        grid.rows[row][col].push(obj);
        obj.grids[index] = { col, row };
      } else {
        // Left the grid, cannot be found until returns to grid.
      }
    });
  }

  addStartingVillages() {
    for (let i = 0; i < this.villages; i++) {
      const home = this.addHome();
      home.addVillager();
    }
  }

  addBandits() {
    const banditCount = Math.floor(((this.villagers.length / 10) * this.banditDensity) - this.bandits.length);
    for (let i = 0; i < banditCount; i++) {
      this.addBandit();
    }
  }

  addBandit() {
    const bandit = new Bandit({
      context: this.context,
      environment: this
    });
    this.objects.push(bandit);
    this.placeObjInGrid(bandit);
    return bandit;
  }

  addStartingApples() {
    for (let i = 0; i < this.maxApples; i++) {
      const apple = new Apple({
        context: this.context,
        randomFood: true,
        minFood: this.minAppleValue,
        maxFood: this.maxAppleValue,
        ageRate: this.appleAgeRate
      });
      this.objects.push(apple);
      this.placeObjInGrid(apple);
    }
  }

  addApples() {
    const apples = this.objects.filter(obj => obj.type === APPLE);
    const appleCount = apples.length;
    const applesToAdd = (this.maxApples - appleCount) / 4;
    if (applesToAdd > 0) {
      for (let i = 0; i < applesToAdd; i++) {
        setTimeout(() => {
          const apple = new Apple({
            context: this.context,
            minFood: this.minAppleValue,
            maxFood: this.maxAppleValue,
            ageRate: this.appleAgeRate
          });
          this.objects.push(apple);
          this.placeObjInGrid(apple);
        }, Math.random() * this.updateDelay * 1000);
      }
    }
  }

  addStolenApple(x, y, food) {
    console.log(food);
    const apple = new Apple({
      context: this.context,
      minFood: this.minAppleValue,
      maxFood: this.maxAppleValue,
      ageRate: this.appleAgeRate,
      x: x,
      y: y,
      foodOverride: food,
      ageRate: 0
    });
    this.objects.push(apple);
    this.placeObjInGrid(apple);
    return apple;
  }

  get maxVillagers() {
    return ((this.canvas.width * this.canvas.height) / 30000) * this.villagerDensity;
  }

  get maxApples() {
    return this.maxVillagers * 2 * this.appleDensity
  }

  get minAppleValue() {
    return this.appleValue * 10;
  }

  get maxAppleValue() {
    return this.minAppleValue * 2;
  }

  addHome() {
    var red = randomNumber({ min: 200, max: 255 });
    var green = randomNumber({ min: 200, max: 255 });
    var blue = randomNumber({ min: 200, max: 255 });
    var home = new Home({
      context: this.context,
      environment: this,
      red: red,
      green: green,
      blue: blue
    });
    this.objects.push(home);
    this.placeObjInGrid(home);
    return home;
  }

  doAnimate() {
    this.homes.forEach(obj => obj.update());
    this.villagers.forEach(obj => obj.update());
    this.apples.forEach(obj => obj.update());
    this.rottenApples.forEach(obj => obj.update());
    this.bandits.forEach(obj => obj.update());
  }

  get homes() {
    return this.objects.filter(obj => obj.type === HOME).sort((a, b) => a.id - b.id);
  }

  get villagers() {
    return this.objects.filter(obj => obj.type === VILLAGER).sort((a, b) => a.id - b.id);
  }

  get apples() {
    return this.objects.filter(obj => obj.type === APPLE).sort((a, b) => a.id - b.id);
  }

  get rottenApples() {
    return this.objects.filter(obj => obj.type === ROTTEN_APPLE).sort((a, b) => a.id - b.id);
  }

  get bandits() {
    return this.objects.filter(obj => obj.type === BANDIT).sort((a, b) => a.id - b.id);
  }
}

customElements.define('cpg-village', CpgVillage);
