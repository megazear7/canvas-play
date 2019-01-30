import Droplet from '/js/objects/droplet.js';
import { getMousePos } from '/js/utility.js';

export default class CpgRain extends HTMLElement {
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
    this.droplets = [];

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
    this.interval = parseFloat(this.getAttribute('interval')) || 15;
    this.startSpeed = parseFloat(this.getAttribute('start-speed')) || 7;
    this.size = parseFloat(this.getAttribute('size')) || 10;
    this.wind = parseFloat(this.getAttribute('wind')) || 2;
    /* --------------------- */

    setInterval(() => {
      var drop = new Droplet({
        context: this.context,
        dy: this.startSpeed,
        dx: this.wind,
        size: this.size
      });
      this.droplets.push(drop);
    }, this.interval);

    setTimeout(() => {
      setInterval(() => {
        this.droplets.shift();
      }, this.interval);
    }, this.interval * 100);

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();
  }

  doAnimate() {
    this.droplets.forEach(droplet => droplet.update());
  }
}

customElements.define('cpg-rain', CpgRain);
