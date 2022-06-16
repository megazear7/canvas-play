import Ball2 from "./ball2.js";
import { getDistance } from '../utility.js';

const TOUGHNESS_ADJ = 3800;

export default class GravityBall extends Ball2 {
    constructor(params) {
        super(params);
        super.changeParams(params, true);
        this.changeParams(params, true);
    }

    changeParams({ mass, name, toughness, env, sticky } = {}, initialize = false) {
        super.changeParams(arguments);
        if (initialize) {
            this.name = typeof name !== 'undefined' ? name : '';
            this.mass = typeof mass !== 'undefined' ? mass : 1;
            this.toughness = typeof toughness !== 'undefined' ? toughness : 1;
            this.env = typeof env !== 'undefined' ? env : {};
            this.sticky = typeof sticky !== 'undefined' ? sticky : false;
            this.img = typeof img !== 'undefined' ? img : undefined;
        } else {
            this.name = typeof name !== 'undefined' ? name : this.name;
            this.mass = typeof mass !== 'undefined' ? mass : this.mass;
            this.toughness = typeof toughness !== 'undefined' ? toughness : this.toughness;
            this.env = typeof env !== 'undefined' ? env : this.env;
            this.sticky = typeof sticky !== 'undefined' ? sticky : this.sticky;
            this.img = typeof img !== 'undefined' ? img : this.img;
        }
    }

    others() {
        return this.env.objs.filter(otherObj => otherObj && this.name !== otherObj.name);
    }

    updateDelta() {
        const objects = this.others();

        objects.forEach(object => {
            const distance = getDistance(this.x, this.y, object.x, object.y);
            if (distance > this.radius + object.radius ) {
                const angle = Math.atan2(object.y - this.y, object.x - this.x);
                const force = (this.mass * object.mass) / (distance * distance);
                const xForce = Math.cos(angle) * force;
                const yForce = Math.sin(angle) * force;
                const xAcc = xForce / this.mass;
                const yAcc = yForce / this.mass;
                this.dx = this.dx + xAcc;
                this.dy = this.dy + yAcc;
            }
        });
    }

    speed() {
        return Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
    }

    updateImpact() {
        const objects = this.others();

        objects.forEach(object => {
            const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x + object.dx, object.y + object.dy);
            if (nextDistance < this.radius + object.radius) {
                if (this.sticky) {
                    if (this.mass < object.mass) {
                        // THIS NO WORKY!
                        this.dx = object.dx;
                        this.dy = object.dy;
                    }
                } else {
                    const newV = collision(this.mass, object.mass, [this.x, this.y], [object.x, object.y], [this.dx, this.dy], [object.dx, object.dy]);
                    this._nextDx = newV[0];
                    this._nextDy = newV[1];
                }

                if (Math.abs(norm(sub([this.dx, this.dy], [this._nextDx, this._nextDy]))) > this.toughness * TOUGHNESS_ADJ * this.mass) {
                    this.fillStyle = 'rgba(255, 0, 0, 1)';
                    this.broken = true;
                }
            }
        });
    }

    update() {
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

        // this.others().forEach(object => {
        //     const nextDistance = getDistance(this.x + this.dx, this.y + this.dy, object.x, object.y);
        //     if (nextDistance < this.radius + object.radius - this.env.scaleFactor) {
        //         const distance = getDistance(this.x, this.y, object.x, object.y) - this.radius - object.radius;
        //         const angle = Math.atan2(object.y - this.y, object.x - this.x);
        //         if (this.mass < object.mass) {
        //             console.log(this.name);
        //             // TODO this is not perfect collision. Issues arrise...
        //             xToMove = this.dx - (Math.cos(angle) * distance);
        //             yToMove = this.dy - (Math.sin(angle) * distance);
        //             this.dx = object.dx;
        //             this.dy = object.dy;
        //         }
        //     }
        // });

        this.x += xToMove;
        this.y += yToMove;
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

            const rotate = Math.atan(this.dx, this.dy);

            this.context.rotate(rotate);
            this.context.drawImage(this.img, -width / 2, -height / 2, width, height);
            this.context.restore();
        } else {
            super.draw();
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