import Ball2 from "./ball2.js";
import { getDistance } from '../utility.js';

const toughness = 2;
const friction = 0.2;
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
        return allObjects.filter(otherObj => this.name !== otherObj.name);
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
                this._nextDx = -1 * collision(this.mass, object.mass, this.dx, object.dx) * (1 - friction);
                this._nextDy = collision(this.mass, object.mass, this.dy, object.dy) * (1 - friction);

                if (speed < stickyness) {
                    // this._nextDx = 0;
                    // this._nextDy = 0;
                }

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

// https://brilliant.org/wiki/analyzing-elastic-collisions/
function collision(m1, m2, u1, u2) {
    return (((m1 - m2) / (m1 + m2)) * u1) + ((2 * m2 * u2) / (m1 + m2))
}
