import { drawCircle, drawLine } from '../utility.js';
import HumanTicTacToePlayer from '../players/tic-tac-toe/human-player.js';
import ComputerTicTacToePlayer from '../players/tic-tac-toe/random-player.js';
import AiTicTacToePlayer from '../players/tic-tac-toe/ai-player.js';

export default class StaticImage {
  constructor({
              context,
              x,
              y,
              size,
              color = "rgba(100,123,212,1)",
              winColor = "rgba(190,90,112,1)",
              lineThickness = 10,
              player1Type = 'human', // 'human', 'ai', or 'random
              player2Type = 'ai',    // 'human', 'ai', or 'random
              computerDelay = 700,
              resetDelay = 3000,
            } = {}) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.winColor = winColor;
    this.lineThickness = lineThickness;
    this.player1Type = player1Type;
    this.player2Type = player2Type;
    this.computerDelay = computerDelay;
    this.resetDelay = resetDelay;

    // Set starting point
    this.setupGame();
    this.player1 = this.generatePlayerOfType(this.player1Type);
    this.player2 = this.generatePlayerOfType(this.player2Type);
    this.players = [ this.player1, this.player2 ];
    this.lines = this.makeLines();
    this.startGame();
  }

  askForMove() {
    if (this.gameOver()) {
      if (this.playerWon(1)) {
        console.log('Player 1 won.');
        this.player1.notifyWin();
        this.player2.notifyLoss();
      } else if (this.playerWon(2)) {
        console.log('Player 2 won.');
        this.player2.notifyWin();
        this.player1.notifyLoss();
      } else {
        console.log('tie');
        this.player1.notifyTie();
        this.player2.notifyTie();
      }


      setTimeout(() => {
        this.setupGame();
        this.startGame();
      }, this.resetDelay);
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

  setupGame() {
    this.cells = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    this.activePlayer = 0;
  }

  startGame() {
    this.players.forEach(player => player.updateCells(this.cells));
    this.askForMove();
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

    const player1Won = this.playerWon(1);
    const player2Won = this.playerWon(2);

    if (player1Won || player2Won) {
      const winner = player1Won ? 1 : 2;
      const winCondition = this.winConditions().find(condition =>
        condition.filter(space => this.cells[space-1] === winner).length === 3);
      const startPoint = this.getPointForPos(winCondition[0]);
      const endPoint = this.getPointForPos(winCondition[2]);

      const winStrike = {
        p1: {
          x: startPoint.x + (this.size / 6),
          y: startPoint.y + (this.size / 6),
        },
        p2: {
          x: endPoint.x + (this.size / 6),
          y: endPoint.y + (this.size / 6),
        }
      }

      drawLine(this.context, winStrike.p1, winStrike.p2, this.lineThickness, this.winColor);
    }
  }

  update() {
    this.draw();
  }

  gameOver() {
    return this.noSpacesLeft() || this.playerWon(1) || this.playerWon(2);
  }

  playerWon(playerIndex) {
    return this.winConditions().filter(condition =>
      condition.filter(space => this.cells[space-1] === playerIndex).length === 3).length > 0;
  }

  noSpacesLeft() {
    return this.cells.filter(cell => cell === 0).length === 0;
  }

  winConditions() {
    return [
      [1,2,3],
      [4,5,6],
      [7,8,9],
      [1,4,7],
      [2,5,8],
      [3,6,9],
      [1,5,9],
      [3,5,7],
    ]
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
  
  generatePlayerOfType(type) {
    if (type === 'human') {
      return new HumanTicTacToePlayer({ cells: this.cells, ticTacToeBoard: this });
    } else if (type === 'ai') {
      return new AiTicTacToePlayer({ cells: this.cells, delay: this.computerDelay, playerNumber: 2 });
    } else {
      return new ComputerTicTacToePlayer({ cells: this.cells, delay: this.computerDelay });
    }
  }
}
