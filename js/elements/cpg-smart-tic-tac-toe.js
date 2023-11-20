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
    this.aiSpeed = parseInt(this.getAttribute('ai-speed')) || 700;
    this.resetDelay = parseInt(this.getAttribute('reset-delay')) || 5000;
    this.player1Type = this.getAttribute('player1-type') || 'human';
    this.player2Type = this.getAttribute('player2-type') || 'ai';
    /* --------------------- */

    this.ticTacToeBoard = new SmartTicTacToe({
      context: this.context,
      x: (this.canvas.width  / 2) - (this.size / 2),
      y: (this.canvas.height / 2) - (this.size / 2),
      size: this.size,
      player1Type: this.player1Type,
      player2Type: this.player2Type,
      computerDelay: this.aiSpeed,
      resetDelay: this.resetDelay,
    });

    this.playerIsActive = true;
    this.listenForClicks();

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

  listenForClicks() {
    document.addEventListener('click', e => {
      const clickPos = this.ticTacToeBoard.findPosFromCoord(e.clientX, e.clientY);
      
      if (clickPos && this.playerIsActive) {
        this.ticTacToeBoard.setX(clickPos);
        this.playerIsActive = false;
      }
    });
  }
}

customElements.define('cpg-smart-tic-tac-toe', CpgSmartTicTacToe);
