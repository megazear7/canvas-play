export default class StaticImage {
  constructor({
              context,
              png,
              x = (Math.random() * window.innerWidth * 2) - (window.innerWidth / 2),
              y = 0,
              angle = 90
            } = {}) {
    this.context = context;
    this.png = png;
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  right() {
    return this.x + this.png.width;
  }

  left() {
    return this.x;
  }

  bottom() {
    return this.y + this.png.height;
  }

  top() {
    return this.y;
  }

  draw() {
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = this.png.width;
    offscreenCanvas.height = this.png.height;
    offscreenCtx.translate(this.png.width/2, this.png.height/2);
    //offscreenCtx.rotate(this.angle / (Math.PI * 180));
    offscreenCtx.rotate((this.angle * Math.PI) / 180);
    offscreenCtx.drawImage(this.png, -(this.png.width/2), -(this.png.height/2));
    this.context.drawImage(offscreenCanvas, this.x, this.y);
  }

  update() {
    this.draw();
  }
}
