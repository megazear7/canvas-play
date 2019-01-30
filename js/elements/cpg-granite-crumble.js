import Crack from '/js/objects/crack.js';
import { getMousePos } from '/js/utility.js';

export default class CpgGraniteCrumble extends HTMLElement {
  constructor() {
    super();

    /* Configuration options */
    /* --------------------- */
    this.size = parseFloat(this.getAttribute('size')) || 10;
    this.speed = parseFloat(this.getAttribute('speed')) || 0;
    this.acceleration = parseFloat(this.getAttribute('acceleration')) || 0.03;
    this.opacity = parseFloat(this.getAttribute('opacity')) || 0.5;
    this.animationLength = parseFloat(this.getAttribute('animation-length')) || 500;
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
    this.cracks = [];

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
    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();

    this.canvas.addEventListener('click', event => {
      var mousePosition = getMousePos(this.canvas, event);
      var directions = [-1, 0, 1];

      directions.forEach(horizontalDir => {
        directions.forEach(verticalDir => {
          if (Math.random() >= 0.5) {
            var crack = new Crack({
              context: this.context,
              segmentCount: 1,
              startX: mousePosition.x,
              startY: mousePosition.y,
              breakSize: this.size,
              breakSpeed: this.speed,
              breakAcceleration: this.acceleration,
              endGrowHorizontalDir: horizontalDir,
              endGrowVerticalDir: verticalDir,
              startGrows: false,
              opacity: this.opacity
            });

            setTimeout(() => {
              this.cracks.forEach(crack => {
                crack.doUpdate = false;
              });
            }, this.animationLength);

            this.cracks.push(crack);
          }
        });
      });
    }, false);
  }

  doAnimate() {
    this.cracks.forEach(crack => crack.update());
  }
}

customElements.define('cpg-granite-crumble', CpgGraniteCrumble);
