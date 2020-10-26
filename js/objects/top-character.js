import { randomX, randomY, randomSpeed, randomColor, drawCircle } from '../utility.js';
import StaticImage from '../objects/static-image.js';

export default class TopCharacter {
  constructor({
              context,
              x = randomX(),
              y = randomY(),
              radius = (Math.random() * 40) + 10,
              imageSwitchRate = 250,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.imageSwitchRate = imageSwitchRate;
    this.lastImageSwitch = new Date();
    this.imageIndex = 0;
    this.imageSet = 'walk';
    this.images = {};

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

      let image = new StaticImage({ context: this.context, png: imageArray[this.imageIndex], x: this.x, y: this.y });

      image.draw();
    }
  }

  update() {
    this.draw();
  }

  imageUrls() {
    return {
      walk: [
        "/images/enmerkar/enmerkar-walk-1.png",
        "/images/enmerkar/enmerkar-walk-2.png"
      ]
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
}
