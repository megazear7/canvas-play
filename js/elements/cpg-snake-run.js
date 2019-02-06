import { getMousePos, drawCircle } from '/js/utility.js';
import Snake from '/js/objects/snake.js';

export default class CpgSnakeRun extends HTMLElement {
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
    /* --------------------- */

    this.radius = 30;

    this.objects.push(new Snake({ canvas: this.canvas }));

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
    this.objects.forEach(object => object.update());
  }
}

customElements.define('cpg-snake-run', CpgSnakeRun);
