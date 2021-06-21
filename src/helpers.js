function eq(a, b, c) {
  if (a === b && a === c && b === c) {
    return true;
  } else {
    return false;
  }
}

//Check winner based on the current board
module.exports = function checkWinner(board) {
  const winList = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winner = null;
  for (let i = 0; i < winList.length; i++) {
    if (eq(board[winList[i][0]], board[winList[i][1]], board[winList[i][2]])) {
      return board[winList[i][0]];
    }
  }
  return winner;
};
