import { fillPoints, randomY } from '/js/utility.js';
import Crack from '/js/objects/crack.js';

export default class CpgCrackOpening extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style>
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
        }
      </style>
      <canvas></canvas>
    `;

    this.canvas = this.shadow.querySelector('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

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
    this.context = this.canvas.getContext('2d');
    this.gap = 0;
    this.gapSpeed = 0;
    this.gapAcceleration = 0.2;
    this.opacity = 0.3;

    this.crack = new Crack({
      context: this.context,
      startX: 0,
      startY: (randomY() / 4) + (window.innerHeight * (3/8)),
      segmentCount: 1,
      breakSize: 10,
      opacity: Math.min(this.opacity * 2, 1),
      breakSpeed: 0,
      breakAcceleration: 0.05,
      startGrows: false,
      endGrowHorizontalDir: 1,
      stayBounded: true
    });

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.crack.update();
      self.doAnimate();
    }

    animate();
  }

  doAnimate() {
    if (this.crack.reachedEdge) {
      this.crack.doUpdate = false;
      this.crack.render = false;
      this.gap += this.gapSpeed;
      this.gapSpeed += this.gapAcceleration;

      var belowPoints = Array.from(this.crack.points);
      belowPoints.push({x: window.innerWidth, y: window.innerHeight});
      belowPoints.push({x: 0, y: window.innerHeight});
      fillPoints({
        context: this.context,
        points: belowPoints,
        shift: this.gap,
        lineOpacity: 0,
        fillOpacity: this.opacity
      });

      var abovePoints = Array.from(this.crack.points);
      abovePoints.push({x: window.innerWidth, y: 0});
      abovePoints.push({x: 0, y: 0});
      fillPoints({
        context: this.context,
        points: abovePoints,
        shift: -this.gap,
        lineOpacity: 0,
        fillOpacity: this.opacity
      });
    } else {
      this.context.fillStyle = `rgb(0, 0, 0, ${this.opacity})`;
      this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
}

customElements.define('cpg-crack-opening', CpgCrackOpening);
