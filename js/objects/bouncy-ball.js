import Ball2 from "./ball2.js";

export default class BouncyBall extends Ball2 {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    update() {
        if (this.x + this.dx < 0 || this.x + this.dx > this.context.canvas.width) {
            this.dx = this.dx * -1;
        }

        if (this.y + this.dy < 0 || this.y + this.dy > this.context.canvas.height) {
            this.dy = this.dy * -1;
        }

        super.update();
    }
}
