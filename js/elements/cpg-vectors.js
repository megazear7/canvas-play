import VectorBall from '../objects/vector-ball.js';
import Ball from '../objects/ball.js';

export default class CpgVectors extends HTMLElement {
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

    this.objects = [];

    this.vectorBall = new VectorBall({
      context: this.context,
      x: 300,
      y: 300
    });
    this.destinationBall = new Ball({
      context: this.context,
      speed: 0,
      radius: 2,
      x: 500,
      y: 300
    });
    this.objects.push(this.vectorBall);
    this.objects.push(this.destinationBall);

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();

    setInterval(() => {
      //console.log(this.vectorBall.v);
    }, 1000);
  }

  doAnimate() {
    this.vectorBall.d.x = this.destinationBall.x;
    this.vectorBall.d.y = this.destinationBall.y;
    this.objects.forEach(obj => obj.update());
  }
}

customElements.define('cpg-vectors', CpgVectors);
