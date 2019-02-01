import { getMousePos, movePoint } from '/js/utility.js';

export default class CpgExplodingImage extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style>
        :host {
          position: relative;
        }

        canvas {
          position: absolute;
        }
      </style>
      <canvas></canvas>
    `;
  }

  connectedCallback() {
    this.canvas = this.shadow.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.mousePosition = {x: 0, y: 0};
    this.friction = 0.9;
    this.particles = [];

    /* ---------------------- */
    /* Configuration Options */
    /* ---------------------- */
    this.href = this.getAttribute('href');
    this.sizeMultiplier = 2;
    /* ---------------------- */

    fetch(this.href)
    .then(response => response.blob())
    .then(blob => {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64data = reader.result;
        this.png = new Image();
        this.png.src = base64data;
        this.beginScene();
      }
    });

    this.canvas.addEventListener('mousemove', event => {
      this.mousePosition = getMousePos(this.canvas, event);
    }, false);
  }

  beginScene() {
    this.style.width = (this.png.width * this.sizeMultiplier) + 'px';
    this.style.height = (this.png.height * this.sizeMultiplier) + 'px';
    this.canvas.width = window.innerWidth;
    this.canvas.height = this.png.width * this.sizeMultiplier * 4;
    this.moveLeft = ((-(window.innerWidth / 2)) + (((this.png.width * this.sizeMultiplier))/2));
    this.canvas.style.left = this.moveLeft + 'px'
    this.moveTop = -(this.png.width * this.sizeMultiplier * 2);
    this.canvas.style.top = this.moveTop + 'px'

    //this.canvas.width = this.png.width * 4;
    //this.canvas.height = this.png.height * 4;
    //this.canvas.style.left = -((this.png.width * this.sizeMultiplier) / 2) + 'px';
    //this.canvas.style.top = -((this.png.height * this.sizeMultiplier) / 2) + 'px';
    this.context.drawImage(this.png, 0, 0);

    var data = this.context.getImageData(0, 0, this.png.width, this.png.height);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var y = 0, y2 = data.height; y < y2; y++) {
      for (var x = 0, x2 = data.width; x < x2; x++) {
        var p = y * 4 * data.width + x * 4;
        if (data.data[p + 3] > 129) {
          var centerX = this.png.width / 2;
          var centerY = this.png.height / 2;
          var distanceX = Math.abs(centerX - x);
          var distanceY = Math.abs(centerY - y);
          var distanceFromCenter = Math.sqrt(Math.pow(distanceX, 2) * Math.pow(distanceY, 2));
          var distanceToCorner = Math.sqrt(Math.pow(centerX, 2) * Math.pow(centerY , 2));
          var speedMultiplier = (distanceFromCenter / distanceToCorner) - 0.5
          var dx = ((Math.random() * 2) - 1) * 4 * speedMultiplier * 20;
          var dy = ((Math.random() * 2) - 1) * 4 * speedMultiplier * 20;
          var particle = {
            x: this.png.width / 2,
            y: this.png.height / 2,
            target: {
              x: x,
              y: y,
            },
            dx: dx,
            dy: dy,
            color:
              "rgb(" +
              data.data[p] +
              "," +
              data.data[p + 1] +
              "," +
              data.data[p + 2] +
              ")"
          };
          this.particles.push(particle);
        }
      }
    }

    var animate;
    animate = () => {
      requestAnimationFrame(animate);
      this.doAnimate();
    }
    animate();
  }

  doAnimate() {
    this.update();
    this.draw();
  }

  update() {
    this.particles.forEach(particle => {
      var diffX = (particle.x - particle.target.x) / 300;
      var diffY = (particle.y - particle.target.y) / 300;

      particle.dx -= diffX;
      particle.dy -= diffY;
      particle.dx *= this.friction;
      particle.dy *= this.friction;

      particle.x += particle.dx;
      particle.y += particle.dy;
    });
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(particle => {
      this.context.fillStyle = particle.color;
      this.context.fillRect(particle.x*this.sizeMultiplier - this.moveLeft, particle.y*this.sizeMultiplier - this.moveTop, 3, 3);
    });
  }
}

customElements.define('cpg-exploding-image', CpgExplodingImage);
