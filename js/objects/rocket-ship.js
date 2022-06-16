import GravityBall from "./gravity-ball.js";

export default class RocketShip extends GravityBall {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
        } else {
        }
    }

    draw() {
        super.draw();

        if (this.isFiring) {
            console.log(isFiring);
        }
    }
}

// https://stackoverflow.com/questions/35211114/2d-elastic-ball-collision-physics
function collision(m1, m2, x1, x2, v1, v2) {
    return sub(
            v1,
            multiply(
                ((2 * m2) / (m1 + m2)) * (dot(sub(v1, v2), sub(x1, x2)) / Math.pow(norm(sub(x1, x2)), 2)),
                sub(x1, x2)
            )
           );
}
