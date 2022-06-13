import Ball2 from "./ball2.js";
import { getDistance } from '../utility.js';

const toughness = 2;
const friction = 0;
const stickyness = 0.5;

export default class GravityBall extends Ball2 {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ mass, name } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
            this.name = typeof name !== 'undefined' ? name : '';
            this.mass = typeof mass !== 'undefined' ? mass : 1;
        } else {
            this.name = typeof name !== 'undefined' ? name : this.name;
            this.mass = typeof mass !== 'undefined' ? mass : this.mass;
        }
    }

    others(allObjects) {
        return allObjects.filter(otherObj => otherObj && this.name !== otherObj.name);
    }

    updateDelta(allObjects) {
        const objects = this.others(allObjects);

        objects.forEach(object => {
            const distance = getDistance(this.x, this.y, object.x, object.y);
            const angle = Math.atan2(object.y - this.y, object.x - this.x);
            const force = (this.mass * object.mass) / (distance * distance);
            const xForce = Math.cos(angle) * force;
            const yForce = Math.sin(angle) * force;
            const xAcc = xForce / this.mass;
            const yAcc = yForce / this.mass;
            this.dx = this.dx + xAcc;
            this.dy = this.dy + yAcc;
        });
    }

    updateImpact(allObjects) {
        const objects = this.others(allObjects);

        objects.forEach(object => {
            const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x + object.dx, object.y + object.dy);
            if (nextDistance < this.radius + object.radius) {
                const speed = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
                const newV = collision(this.mass, object.mass, [this.x, this.y], [object.x, object.y], [this.dx, this.dy], [object.dx, object.dy]);
                this._nextDx = newV[0];
                this._nextDy = newV[1];

                if (speed > toughness && this.name === 'rocket') {
                    this.fillStyle = 'rgba(255, 0, 0, 1)';
                }
            }
        });
    }

    update(allObjects) {
        const objects = this.others(allObjects);
        if (this._nextDx !== undefined) {
            this.dx = this._nextDx;
            this._nextDx = undefined;
        }
        if (this._nextDy !== undefined) {
            this.dy = this._nextDy;
            this._nextDy = undefined;
        }
        let xToMove = this.dx;
        let yToMove = this.dy;

        objects.forEach(object => {
            const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x, object.y);
            if (nextDistance < this.radius + object.radius) {
                const distance = getDistance(this.x, this.y, object.x, object.y) - this.radius - object.radius;
                const angle = Math.atan2(object.y - this.y, object.x - this.x);

                xToMove = Math.cos(angle) * distance;
                yToMove = Math.sin(angle) * distance;
            }
        });

        this.x += xToMove;
        this.y += yToMove;
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

function multiply(x, v) {
    return [v[0] * x, v[1] * x];
}

function dot(v1, v2) {
    return v1.map((x, i) => v1[i] * v2[i]).reduce((m, n) => m + n);
}

function sub(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
}

function norm(x) {
    return Math.sqrt(Math.pow(x[0], 2) + Math.pow(x[1], 2));
}