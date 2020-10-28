import { drawCircle, drawLine } from '../utility.js';
import HumanTicTacToePlayer from '../other/human-tic-tac-toe-player.js';
import ComputerTicTacToePlayer from '../other/computer-tic-tac-toe-player.js';

export default class StaticImage {
  constructor({
              context,
              x,
              y,
              size,
              color = "rgba(100,123,212,1)",
              lineThickness = 10,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.lineThickness = lineThickness;

    // Set starting point
    this.cells = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    this.lines = this.makeLines();
    this.players = [
      //new HumanTicTacToePlayer({ cells: this.cells }),
      new ComputerTicTacToePlayer({ cells: this.cells }),
      new ComputerTicTacToePlayer({ cells: this.cells }),
    ];
    this.activePlayer = 0;
    this.askForMove();
  }

  askForMove() {
    if (this.gameOver()) {
      alert("Game over");
      console.log(this.cells);
    } else {
      this.players[this.activePlayer].makeMove()
      .then((move) => {
        if (this.isValidMove(move)) {
          this.activePlayer === 0 ? this.setX(move) : this.setY(move);
          this.players.forEach(player => player.updateCells(this.cells));
          this.activePlayer = this.activePlayer === 0 ? 1 : 0;
          this.askForMove();
        } else {
          console.error(`invalid move of ${move} recieved by player ${this.activePlayer + 1}`)
          this.askForMove();
        }
      });
    }
  }

  draw() {
    this.lines.forEach(line => drawLine(this.context, line.p1, line.p2, this.lineThickness, this.color));

    this.cells.forEach((cell, index) => {
      if (cell === 1) {
        this.drawX(index + 1);
      } else if (cell === 2) {
        this.drawY(index + 1);
      }
    });
  }

  update() {
    this.draw();
  }

  gameOver() {
    return this.cells.filter(cell => cell === 0).length === 0;
  }

  isValidMove(move) {
    return move >= 1 && move <= 9 && this.cells[move-1] === 0;
  }

  drawX(pos) {
    const topLeft = this.getPointForPos(pos);

    const xLines = [{
      p1: { x: topLeft.x + (this.lineThickness*2), y: topLeft.y + (this.lineThickness*2) },
      p2: { x: topLeft.x + (this.size * (1/3)) - (this.lineThickness*2), y: topLeft.y + (this.size * (1/3)) - (this.lineThickness*2)},
    }, {
      p1: { x: topLeft.x + (this.size * (1/3)) - (this.lineThickness*2), y: topLeft.y + (this.lineThickness*2) },
      p2: { x: topLeft.x + (this.lineThickness*2), y: topLeft.y + (this.size * (1/3)) - (this.lineThickness*2) },
    }];

    xLines.forEach(line => drawLine(this.context, line.p1, line.p2, this.lineThickness, this.color));
  }

  drawY(pos) {
    const topLeft = this.getPointForPos(pos);

    drawCircle({
      context: this.context,
      x: topLeft.x + ((this.size * (1/3))/2),
      y: topLeft.y + ((this.size * (1/3))/2),
      radius: ((this.size * (1/3))/2) - (this.lineThickness*2),
      lineWidth: this.lineThickness,
      lineStyle: this.color,
      opacity: 0,
    });
  }

  getPointForPos(pos) {
    const gridX = ((pos - 1) % 3);
    const gridY = Math.ceil(pos/3) - 1;

    return { x: this.x + (this.size * (gridX/3)), y: this.y + (this.size * (gridY/3)) };
  }

  makeLines() {
    return [{
        p1: { x: this.x + (this.size * (1/3)), y: this.y },
        p2: { x: this.x + (this.size * (1/3)), y: this.y + this.size },
      }, {
        p1: { x: this.x + (this.size * (2/3)), y: this.y },
        p2: { x: this.x + (this.size * (2/3)), y: this.y + this.size },
      }, {
        p1: { x: this.x,             y: this.y + (this.size * (1/3)) },
        p2: { x: this.x + this.size, y: this.y + (this.size * (1/3)) },
      }, {
        p1: { x: this.x,             y: this.y + (this.size * (2/3)) },
        p2: { x: this.x + this.size, y: this.y + (this.size * (2/3)) },
    }];
  }

  setX(pos) {
    this.cells[pos-1] = 1;
  }

  setY(pos) {
    this.cells[pos-1] = 2;
  }

  // xOrY should be 'x' or 'y'
  set(pos, xOrY) {
    this.cells[pos-1] = xOrY === 'x' ? 1 : 2;
  }

  findPosFromCoord(x, y) {
    const relativeX = x - this.x;
    const relativeY = y - this.y;
    const pos = {
      x: Math.ceil(relativeX / (this.size * (1/3))),
      y: Math.ceil(relativeY / (this.size * (1/3))),
    };

    if (pos.x >= 1 && pos.x <= 3 && pos.y >= 1 && pos.y <= 3) {
      return (pos.y - 1) * 3 + pos.x;
    } else {
      return null;
    }
  }
}
