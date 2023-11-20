import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';
import StaticImage from '../objects/static-image.js';

export default class TopCharacter {
  constructor({
              context,
              x = randomX(),
              y = randomY(),
              radius = 100,
              movementRate = 2,
              imageSwitchRate = 75,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.movementRate = movementRate;
    this.imageSwitchRate = imageSwitchRate;
    this.lastImageSwitch = new Date();
    this.imageIndex = 0;
    this.imageSet = 'walk';
    this.images = {};
    this.direction = 0;

    this.listenForKeys();

    this.loadImages()
    .then(() => {
      this.imagesLoaded = true;
    })
  }

  right() {
    return this.x + this.radius;
  }

  left() {
    return this.x - this.radius;
  }

  bottom() {
    return this.y + this.radius;
  }

  top() {
    return this.y - this.radius;
  }

  draw() {
    let oldImageSet = this.imageSet;

    if (this.attacking()) {
      this.imageSet = "attack";
    } else if (this.moving()) {
      this.imageSet = "walk";
      this.makeMove();
    } else {
      this.imageSet = "stand";
    }

    if (oldImageSet != this.imageSet) {
      this.imageIndex = 0;
    }

    if (this.imagesLoaded) {

      let imageArray = this.images[this.imageSet];

      if ((new Date() - this.lastImageSwitch) > this.imageSwitchRate) {
        if (this.imageIndex >= (imageArray.length - 1)) {
          this.imageIndex = 0;
        } else {
          this.imageIndex += 1;
        }
        this.lastImageSwitch = new Date();
      }

      this.updateDirection();
      let image = new StaticImage({
        context: this.context,
        png: imageArray[this.imageIndex],
        x: this.x,
        y: this.y,
        width: this.radius,
        height: this.radius,
        angle: this.direction
      });

      image.draw();
    }
  }

  update() {
    this.draw();
  }

  imageUrls() {
    return {
      attack: [
        "/images/enmerkar/enmerkar-stab-1.png",
        "/images/enmerkar/enmerkar-stab-2.png",
      ],
      walk: [
        "/images/enmerkar/enmerkar-walk-1.png",
        "/images/enmerkar/enmerkar-walk-2.png",
        "/images/enmerkar/enmerkar-walk-3.png",
        "/images/enmerkar/enmerkar-walk-4.png",
        "/images/enmerkar/enmerkar-walk-5.png",
        "/images/enmerkar/enmerkar-walk-6.png",
        "/images/enmerkar/enmerkar-walk-7.png",
        "/images/enmerkar/enmerkar-walk-8.png",
        "/images/enmerkar/enmerkar-walk-9.png",
        "/images/enmerkar/enmerkar-walk-10.png",
        "/images/enmerkar/enmerkar-walk-11.png",
        "/images/enmerkar/enmerkar-walk-12.png",
      ],
      stand: [
        "/images/enmerkar/enmerkar-walk-1.png",
      ],
    }
  }

  loadImages() {
    let promises = [];

    Object.keys(this.imageUrls()).forEach(key => {
      if (! this.images[key]) this.images[key] = [];
      this.imageUrls()[key].forEach((imageUrl, index) => {
        promises.push(
          this.loadImage(imageUrl)
          .then(png => this.images[key][index] = png)
        );
      });
    });

    return Promise.all(promises);
  }

  loadImage(url) {
    return fetch(url)
    .then(response => response.blob())
    .then(blob => {
      return new Promise(resolve => {
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          let base64data = reader.result;
          let png = new Image();
          png.src = base64data;
          png.onload = () => resolve(png);
        }
      });
    })
  }

  makeMove() {
    if (this.keys.up && this.keys.left) {
      this.y -= Math.cos(Math.PI/4) * this.movementRate;
      this.x -= Math.cos(Math.PI/4) * this.movementRate;
    } else if (this.keys.up && this.keys.right) {
      this.y -= Math.cos(Math.PI/4) * this.movementRate;
      this.x += Math.cos(Math.PI/4) * this.movementRate;
    } else if (this.keys.down && this.keys.left) {
      this.y += Math.cos(Math.PI/4) * this.movementRate;
      this.x -= Math.cos(Math.PI/4) * this.movementRate;
    } else if (this.keys.down && this.keys.right) {
      this.y += Math.cos(Math.PI/4) * this.movementRate;
      this.x += Math.cos(Math.PI/4) * this.movementRate;
    } else if (this.keys.up) {
      this.y -= this.movementRate;
    } else if (this.keys.left) {
      this.x -= this.movementRate;
    } else if (this.keys.down) {
      this.y += this.movementRate;
    } else if (this.keys.right) {
      this.x += this.movementRate;
    }
  }

  updateDirection() {
    if (this.keys.up && this.keys.left) {
      this.direction = 315;
    } else if (this.keys.up && this.keys.right) {
      this.direction = 45;
    } else if (this.keys.down && this.keys.left) {
      this.direction = 225;
    } else if (this.keys.down && this.keys.right) {
      this.direction = 135;
    } else if (this.keys.up) {
      this.direction = 0;
    } else if (this.keys.left) {
      this.direction = 270;
    } else if (this.keys.down) {
      this.direction = 180;
    } else if (this.keys.right) {
      this.direction = 90;
    }
  }

  attacking() {
    return this.keys.space;
  }

  moving() {
    return this.keys.up || this.keys.left || this.keys.down || this.keys.right;
  }

  listenForKeys() {
    this.keys = {
      up: false,
      left: false,
      down: false,
      right: false,
    }

    const keysToWatch = {
      W: 'up',
      A: 'left',
      S: 'down',
      D: 'right',
      ' ': 'space',
    }

    document.addEventListener("keydown", e => {
      Object.keys(keysToWatch).forEach(objKey => {
        if (String.fromCharCode(e.which) == objKey) {
          this.keys[keysToWatch[objKey]] = true;
        }
      });
    });

    document.addEventListener("keyup", e => {
      Object.keys(keysToWatch).forEach(objKey => {
        if (String.fromCharCode(e.which) == objKey) {
          this.keys[keysToWatch[objKey]] = false;
        }
      });
    });
  }
}
