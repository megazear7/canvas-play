import SmartTicTacToe from "../objects/smart-tic-tac-toe.js";

export default class CpgSmartTicTacToe extends HTMLElement {
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
  }

  connectedCallback() {
    /* ---------------------- */
    /* Configuration options */
    /* --------------------- */
    this.size = parseInt(this.getAttribute('size')) || 300;
    /* --------------------- */

    this.ticTacToeBoard = new SmartTicTacToe({
      context: this.context,
      x: (this.canvas.width  / 2) - (this.size / 2),
      y: (this.canvas.height / 2) - (this.size / 2),
      size: this.size,
    });

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
    }

    animate();
  }

  doAnimate() {
    this.ticTacToeBoard.update();
  }
}

customElements.define('cpg-smart-tic-tac-toe', CpgSmartTicTacToe);
