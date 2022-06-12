import Circle from "./circle.js";

export default class Ball2 extends Circle {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ dx, dy } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
            console.log(dx, dy);
            this.dx = typeof dx !== 'undefined' ? dx : Math.random() > 0.5 ? 5 : -5;
            this.dy = typeof dy !== 'undefined' ? dy : Math.random() > 0.5 ? 5 : -5;
        } else {
            this.dx = typeof dx !== 'undefined' ? dx : this.dx;
            this.dy = typeof dy !== 'undefined' ? dy : this.dy;
        }
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}
