import GravityBall from "./gravity-ball.js";

export default class RocketShip extends GravityBall {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ img } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
            this.img = typeof img !== 'undefined' ? img : undefined;
        } else {
            this.img = typeof img !== 'undefined' ? img : this.img;
        }
    }

    brake() {
        this.img = this.env.explosionImg;
        setTimeout(() => {
            this.env.origin = this.env.earth;
            this.env.rocket = undefined;
            this.env.objs = this.env.objs.filter(obj => obj.name !== 'rocket');
        }, 2000);
    }

    noFuel() {
        this.img = this.env.noFuelRocket;
    }

    draw() {
        if (this.img) {
            this.img.width;
            this.img.height;
            const largerDimension = this.img.width > this.img.height ? 'h' : 'w';
            const width = largerDimension === 'w' ? this.radius : ((this.img.width / this.img.height) * this.radius);
            const height = largerDimension === 'h' ? this.radius : ((this.img.height / this.img.width) * this.radius);
            this.context.save();
            this.context.setTransform(1, 0, 0, 1, this.x, this.y);
            this.context.rotate(this.direction());
            if (this.broken) {
                this.context.drawImage(this.img, -width, -height, width * 2, height * 2);
            } else {
                this.context.drawImage(this.img, -width / 2, -height / 2, width, height);
            }
            this.context.restore();
        } else {
            super.draw();
        }
    }
}
