var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var resizeTimer;
window.onresize = event => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, 250);
};

export default canvas;
