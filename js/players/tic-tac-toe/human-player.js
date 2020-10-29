export default class HumanTicTacToePlayer {
  constructor({
            cells,
            ticTacToeBoard,
            } = {}) {
    this.cells = cells;
    this.ticTacToeBoard = ticTacToeBoard;
  }

  makeMove() {
    return new Promise(resolve => {
      const listener = this.listenForClick;
      document.addEventListener('click', listener(this, resolve, listener));
    });
  }

  listenForClick(self, resolve, listener) {
    return e => {
      const clickPos = self.ticTacToeBoard.findPosFromCoord(e.clientX, e.clientY);
      
      if (clickPos && self.cells[clickPos-1] === 0) {
        document.removeEventListener('click', listener);
        resolve(clickPos);
      }
    };
  }

  notifyWin() {
  }

  notifyLoss() {
  }

  notifyTie() {
  }

  updateCells(cells) {
    this.cells = cells;
  }
}