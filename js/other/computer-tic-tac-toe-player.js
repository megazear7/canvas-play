export default class ComputerTicTacToePlayer {
  constructor({
            cells,
            delay,
            } = {}) {
    this.cells = cells;
    this.delay = delay;
  }

  makeMove() {
    return new Promise(resolve => {
      setTimeout(() => {
        return resolve(this.findRandomOpenCell());
      }, this.delay);
    });
  }

  findRandomOpenCell() {
    const move = this.randomCell();

    if (this.cells[move-1] === 0) {
      return move;
    } else {
      return this.findRandomOpenCell();
    }
  }

  randomCell() {
    return Math.floor(Math.random() * 9) + 1;
  }

  updateCells(cells) {
    this.cells = cells;
  }
}