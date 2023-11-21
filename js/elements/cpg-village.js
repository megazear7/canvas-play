import Villager, { VILLAGER } from '/js/objects/villager.js';
import Apple, { APPLE } from '/js/objects/apple.js';
import Home, { HOME } from '/js/objects/home.js';
import { randomNumber } from '../utility.js';

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
    this.interval = parseFloat(this.getAttribute('interval')) || 5;
    this.maxApples = parseFloat(this.getAttribute('max-apples')) || 10;
    this.startApples = parseFloat(this.getAttribute('start-apples')) || 10;
    this.villages = parseFloat(this.getAttribute('villages')) || 3;
    /* --------------------- */

    for (let i = 0; i < this.startApples; i++) {
      this.objects.push(new Apple({ context: this.context, environment: this }));
    }
    for (let i = 0; i < this.villages; i++) {
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
    }

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();

    setInterval(() => this.majorUpdates(), 1000);
  }

  majorUpdates() {
    this.objects = this.objects.filter(obj => !obj.destroy);
    this.objects.forEach(obj => obj.majorUpdate());
    this.addApple();
  }

  addApple() {
    const apples = this.objects.filter(obj => obj.type === APPLE);
    const appleCount = apples.length;
    if (appleCount < this.maxApples) {
      this.objects.push(new Apple({ context: this.context }));
    }
  }

  doAnimate() {
    this.apples.forEach(obj => obj.update());
    this.homes.forEach(obj => obj.update());
    this.villagers.forEach(obj => obj.update());
  }

  get apples() {
    return this.objects.filter(obj => obj.type === APPLE);
  }

  get homes() {
    return this.objects.filter(obj => obj.type === HOME);
  }

  get villagers() {
    return this.objects.filter(obj => obj.type === VILLAGER);
  }
}

customElements.define('cpg-village', CpgVillage);
