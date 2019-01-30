import Bubble from '/js/objects/bubble.js';
import { getMousePos } from '/js/utility.js';

export default class CpgRainbowBubbles extends HTMLElement {
  constructor() {
    super();

    /* Configuration options */
    /* --------------------- */
    this.bubbleCount = parseInt(this.getAttribute('bubble-count')) || window.innerWidth / 5;
    this.speed = parseFloat(this.getAttribute('speed')) || 0.5;
    this.radius = parseFloat(this.getAttribute('radius')) || 80;

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
    this.bubbles = [];

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
    for (var i = 0; i < this.bubbleCount; i++) {
      this.bubbles.push(new Bubble({
        context: this.context,
        speed: this.speed,
        mousePosition: this.mousePosition,
        radius: (Math.random() * this.radius) + (this.radius/4),
        minRadius: (Math.random() * (this.radius/4)) + (this.radius/16)
      }));
    }

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();

    this.canvas.addEventListener('mousemove', event => {
      this.mousePosition = getMousePos(this.canvas, event);
    }, false);
  }

  doAnimate() {
    this.bubbles.forEach(bubble => bubble.update(this.mousePosition));
  }
}

customElements.define('cpg-rainbow-bubbles', CpgRainbowBubbles);
