export default class BaseElement extends HTMLElement {
    configure({ fullScreen = false } = {}) {
        this.shadow = this.attachShadow({ mode: 'open' });
        fullScreen ? this.makeFullScreen() : this.fillContainer();
        this.createCanvas();
        this.setResizeTimer();
    }

    makeFullScreen() {
        this.shadow.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                }
                canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
            </style>
            <canvas></canvas>
        `;
    }

    fillContainer() {
        this.shadow.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                    width: 100%;
                }
                canvas {
                    display: block;
                    height: 100%;
                    width: 100%;
                }
            </style>
            <canvas></canvas>
        `;
    }

    createCanvas() {
        this.canvas = this.shadow.querySelector('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');
    }

    setResizeTimer() {
        var resizeTimer;
        window.onresize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }, 250);
        };
    }

    startAnimation() {
        var animate;
        animate = () => {
            requestAnimationFrame(animate);
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.update();
            this.animate();
        }
        animate();
    }

    update() {
    }

    animate() {
    }

    changeParam() {
    }

    changeParams() {
        this._attrs.forEach(attr => this.changeParam(this.attrToProp(attr)));
    }

    createProp(attr) {
        const prop = this.attrToProp(attr);

        Object.defineProperty(this, prop, {
            get: () => {
                return this['_' + prop];
            },
            set: newVal => {
                this['_' + prop] = newVal;
                this.changeParam(prop);
                this.setAttribute(attr, newVal);
            },
        });
    }

    createProps(attrs) {
        this._attrs = attrs;
        if (attrs) {
            attrs.forEach(attr => this.createProp(attr));
        }
    }

    attrToProp(attr) {
        return attr.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }
}
