(function(a,b){if("function"==typeof define&&define.amd)define(["exports","../utility.js","../objects/crack.js"],b);else if("undefined"!=typeof exports)b(exports,require("../utility.js"),require("../objects/crack.js"));else{var c={exports:{}};b(c.exports,a.utility,a.crack),a.cpgCrackOpening=c.exports}})(this,function(a,b,c){"use strict";function d(a){return d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},d(a)}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function g(a,b,c){return b&&f(a.prototype,b),c&&f(a,c),a}function h(a,b){return b&&("object"===d(b)||"function"==typeof b)?b:i(a)}function i(a){if(void 0===a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a}function j(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function");a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,writable:!0,configurable:!0}}),b&&q(a,b)}function k(a){var b="function"==typeof Map?new Map:void 0;return k=function(a){function c(){return m(a,arguments,r(this).constructor)}if(null===a||!n(a))return a;if("function"!=typeof a)throw new TypeError("Super expression must either be null or a function");if("undefined"!=typeof b){if(b.has(a))return b.get(a);b.set(a,c)}return c.prototype=Object.create(a.prototype,{constructor:{value:c,enumerable:!1,writable:!0,configurable:!0}}),q(c,a)},k(a)}function l(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(a){return!1}}function m(){return m=l()?Reflect.construct:function(b,c,d){var e=[null];e.push.apply(e,c);var a=Function.bind.apply(b,e),f=new a;return d&&q(f,d.prototype),f},m.apply(null,arguments)}function n(a){return-1!==Function.toString.call(a).indexOf("[native code]")}function q(a,b){return q=Object.setPrototypeOf||function(a,b){return a.__proto__=b,a},q(a,b)}function r(a){return r=Object.setPrototypeOf?Object.getPrototypeOf:function(a){return a.__proto__||Object.getPrototypeOf(a)},r(a)}Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0,c=function(a){return a&&a.__esModule?a:{default:a}}(c);var s=/*#__PURE__*/function(a){function d(){var a;e(this,d),a=h(this,r(d).call(this)),a.shadow=a.attachShadow({mode:"open"}),a.shadow.innerHTML="\n      <style>\n        canvas {\n          position: absolute;\n          top: 0;\n          left: 0;\n          z-index: 1000;\n        }\n      </style>\n      <canvas></canvas>\n    ",a.canvas=a.shadow.querySelector("canvas"),a.canvas.width=window.innerWidth,a.canvas.height=window.innerHeight;var b;return window.onresize=function(){clearTimeout(b),b=setTimeout(function(){a.canvas.width=window.innerWidth,a.canvas.height=window.innerHeight},250)},a}return j(d,a),g(d,[{key:"connectedCallback",value:function e(){function a(){requestAnimationFrame(a),d.context.clearRect(0,0,window.innerWidth,window.innerHeight),d.doAnimate(),d.crack.update()}this.context=this.canvas.getContext("2d"),this.gap=0,this.gapSpeed=parseFloat(this.dataset.gapSpeed)||0,this.gapAcceleration=parseFloat(this.dataset.gapAcceleration)||.2,this.lineRed=parseFloat(this.dataset.lineRed)||0,this.lineGreen=parseFloat(this.dataset.lineGreen)||0,this.lineBlue=parseFloat(this.dataset.lineBlue)||0,this.lineOpacity=parseFloat(this.dataset.lineOpacity)||1,this.fillRed=parseFloat(this.dataset.fillRed)||230,this.fillGreen=parseFloat(this.dataset.fillGreen)||230,this.fillBlue=parseFloat(this.dataset.fillBlue)||230,this.fillOpacity=parseFloat(this.dataset.fillOpacity)||1,this.acceleration=parseFloat(this.dataset.acceleration)||.05,this.crack=new c.default({context:this.context,startX:0,startY:(0,b.randomY)()/4+window.innerHeight*(3/8),segmentCount:1,breakSize:10,red:this.lineRed,blue:this.lineBlue,green:this.lineGreen,opacity:this.lineOpacity,breakSpeed:0,breakAcceleration:this.acceleration,startGrows:!1,endGrowHorizontalDir:1,stayBounded:!0});var d=this;a()}},{key:"doAnimate",value:function d(){if(this.crack.reachedEdge){this.crack.doUpdate=!1,this.crack.render=!1,this.gap+=this.gapSpeed,this.gapSpeed+=this.gapAcceleration;var a=Array.from(this.crack.points);a.push({x:window.innerWidth,y:window.innerHeight}),a.push({x:0,y:window.innerHeight}),(0,b.fillPoints)({context:this.context,points:a,shift:this.gap,fillRed:this.fillRed,fillGreen:this.fillGreen,fillBlue:this.fillBlue,fillOpacity:this.fillOpacity,lineOpacity:0});var c=Array.from(this.crack.points);c.push({x:window.innerWidth,y:0}),c.push({x:0,y:0}),(0,b.fillPoints)({context:this.context,points:c,shift:-this.gap,fillRed:this.fillRed,fillGreen:this.fillGreen,fillBlue:this.fillBlue,fillOpacity:this.fillOpacity,lineOpacity:0})}else this.context.fillStyle="rgb(".concat(this.fillRed,", ").concat(this.fillGreen,", ").concat(this.fillBlue,", ").concat(this.fillOpacity,")"),this.context.fillRect(0,0,window.innerWidth,window.innerHeight)}}]),d}(k(HTMLElement));a.default=s,customElements.define("cpg-crack-opening",s)});