export type SudokuBoard = (number | null)[][];

const createEmptyBoard = (): SudokuBoard =>
  Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

const isSafe = (
  board: SudokuBoard,
  row: number,
  col: number,
  num: number
): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }

  const startRow = row - (row % 3);
  const startCol = col - (col % 3);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
};

const fillBoard = (board: SudokuBoard): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const shuffle = (arr: number[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const removeCells = (board: SudokuBoard, count: number) => {
  let removed = 0;
  while (removed < count) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== null) {
      board[row][col] = null;
      removed++;
    }
  }
};

export const generateSudoku = (
  difficulty: "easy" | "medium" | "hard" = "medium"
): SudokuBoard => {
  const board = createEmptyBoard();
  fillBoard(board);

  const clone: SudokuBoard = board.map((row) => [...row]);

  const difficultyMap = {
    easy: 30,
    medium: 45,
    hard: 55,
  };

  removeCells(clone, difficultyMap[difficulty]);

  return clone;
};
