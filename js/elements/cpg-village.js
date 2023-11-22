import Villager, { VILLAGER } from '/js/objects/villager.js';
import Apple, { APPLE } from '/js/objects/apple.js';
import Home, { HOME } from '/js/objects/home.js';
import { randomNumber } from '../utility.js';
import { ROTTEN_APPLE } from '../objects/apple.js';

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
    this.updateDelay = parseFloat(this.getAttribute('update-delay')) || 1;
    this.appleValue = parseFloat(this.getAttribute('apple-value')) || 1;
    this.appleAgeRate = parseFloat(this.getAttribute('apple-age-rate')) || 1;
    this.startApples = parseFloat(this.getAttribute('start-apples')) || 10;
    this.villages = parseFloat(this.getAttribute('villages')) || 3;
    /* --------------------- */

    console.log(this.minAppleValue);
    console.log(this.maxAppleValue);

    this.addStartingApples();
    this.addStartingVillages();

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
    this.objects.forEach(obj => obj.majorUpdate());
    this.addApples();
  }

  minorUpdates() {
    this.objects = this.objects.filter(obj => !obj.destroy);
    this.objects.forEach(obj => obj.minorUpdate());
  }
  
  addStartingVillages() {
    for (let i = 0; i < this.villages; i++) {
      this.addHome().addVillager();
    }
  }

  addStartingApples() {
    for (let i = 0; i < this.maxApples; i++) {
      this.objects.push(new Apple({
        context: this.context,
        randomFood: true,
        minFood: this.minAppleValue,
        maxFood: this.maxAppleValue,
        ageRate: this.appleAgeRate
      }));
    }
  }

  addApples() {
    const apples = this.objects.filter(obj => obj.type === APPLE);
    const appleCount = apples.length;
    const applesToAdd = (this.maxApples - appleCount) / 4;
    if (applesToAdd > 0) {
      for (let i = 0; i < applesToAdd; i++) {
        setTimeout(() => {
          this.objects.push(new Apple({
            context: this.context,
            minFood: this.minAppleValue,
            maxFood: this.maxAppleValue,
            ageRate: this.appleAgeRate
          }));
        }, Math.random() * this.updateDelay * 1000);
      }
    }
  }

  get maxApples() {
    return ((this.canvas.width * this.canvas.height) / 10000) * this.appleDensity;
  }

  get minAppleValue() {
    return ((this.canvas.width * this.canvas.height) / 100000) * this.appleValue
  }

  get maxAppleValue() {
    return ((this.canvas.width * this.canvas.height) / 100000) * 2 * this.appleValue
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
    return home;
  }

  doAnimate() {
    this.homes.forEach(obj => obj.update());
    this.villagers.forEach(obj => obj.update());
    this.apples.forEach(obj => obj.update());
    this.rottenApples.forEach(obj => obj.update());
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
}

customElements.define('cpg-village', CpgVillage);
