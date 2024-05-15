import { VILLAGER } from '/js/objects/villager.js';
import Bandit from '/js/objects/bandit.js';
import  Apple, { APPLE } from '/js/objects/apple.js';
import Home, { HOME } from '/js/objects/home.js';
import { drawCircle, randomNumber } from '../utility.js';
import { ROTTEN_APPLE } from '../objects/apple.js';
import { BANDIT } from '../objects/bandit.js';
import Arrow, { ARROW } from '../objects/arrow.js';
import Circle from '../objects/circle.js';
import ScrollableMap from '../objects/scrollable-map.js';

export default class CpgReturnOfHistory extends HTMLElement {
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

    var resizeTimer;
    window.onresize = event => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }, 250);
    };

    this.userActions = {
      zoomOut: false,
      zoomIn: false,
      scrollUp: false,
      scrollDown: false,
      scrollRight: false,
      scrollLeft: false,
    };

    document.addEventListener('keydown', e => {
      if (e.key === '=' || e.key === '+') {
        this.userActions.zoomIn = true;
      } else if (e.key === '-') {
        this.userActions.zoomOut = true;
      } else if ((e.key === 'ArrowUp')) {
        this.userActions.scrollUp = true;
      } else if (e.key === 'ArrowDown') {
        this.userActions.scrollDown = true;
      } else if (e.key === 'ArrowRight') {
        this.userActions.scrollRight = true;
      } else if (e.key === 'ArrowLeft') {
        this.userActions.scrollLeft = true;
      }
    });-

    document.addEventListener('keyup', e => {
      if (e.key === '=' || e.key === '+') {
        this.userActions.zoomIn = false;
      } else if (e.key === '-') {
        this.userActions.zoomOut = false;
      } else if ((e.key === 'ArrowUp')) {
        this.userActions.scrollUp = false;
      } else if (e.key === 'ArrowDown') {
        this.userActions.scrollDown = false;
      } else if (e.key === 'ArrowRight') {
        this.userActions.scrollRight = false;
      } else if (e.key === 'ArrowLeft') {
        this.userActions.scrollLeft = false;
      }
    });
  }

  connectedCallback() {
    /* ---------------------- */
    /* Configuration options */
    /* --------------------- */
    this.scrollSpeed = parseFloat(this.getAttribute('scroll-speed')) || 1;
    this.zoomSpeed = parseFloat(this.getAttribute('scroll-speed')) || 0.005;
    /* --------------------- */

    this.map = new ScrollableMap({
      context: this.context,
      canvas: this.canvas,
      width: 5000,
      height: 5000,
    });

    this.map.objects.push(new Circle({ context: this.context, radius: 10, x: 100, y: -100 }));
    this.map.objects.push(new Circle({ context: this.context, radius: 10, x: 100, y: 100 }));
    this.map.objects.push(new Circle({ context: this.context, radius: 10, x: -100, y: 100 }));

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();
  }

  doAnimate() {
    if (this.userActions.zoomIn) {
      this.map.zoom(1 + this.zoomSpeed);
    }
    
    if (this.userActions.zoomOut) {
      this.map.zoom(1 - this.zoomSpeed);
    }
    
    if (this.userActions.scrollUp) {
      this.map.scrollUp(this.scrollSpeed);
    }
    
    if (this.userActions.scrollDown) {
      this.map.scrollUp(this.scrollSpeed * -1);
    }
    
    if (this.userActions.scrollRight) {
      this.map.scrollLeft(this.scrollSpeed * -1);
    }
    
    if (this.userActions.scrollLeft) {
      this.map.scrollLeft(this.scrollSpeed);
    }

    this.map.update();
    this.map.draw();
  }
}

customElements.define('cpg-return-of-history', CpgReturnOfHistory);
