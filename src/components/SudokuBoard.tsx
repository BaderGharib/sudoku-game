import React, { useState, useEffect } from "react";
import SudokuCell from "./SudokuCell";
import type { SudokuBoard as SudokuBoardType } from "../utils/sudokuGenerator";
import { generateSudoku } from "../utils/sudokuGenerator";
import { solveSudoku } from "../utils/sudokuSolver";

const SudokuBoard: React.FC = () => {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [puzzle, setPuzzle] = useState<SudokuBoardType>(() =>
    generateSudoku(difficulty)
  );
  const [board, setBoard] = useState<SudokuBoardType>(puzzle);
  const [checkResult, setCheckResult] = useState<string>("");
  const [fixedCells, setFixedCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fixed = new Set<string>();
    puzzle.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell !== null) fixed.add(`${i}-${j}`);
      })
    );
    setFixedCells(fixed);
  }, [puzzle]);

  const handleGeneratePuzzle = (level?: "easy" | "medium" | "hard") => {
    const newLevel = level ?? difficulty;
    const newPuzzle = generateSudoku(newLevel);
    setPuzzle(newPuzzle);
    setBoard(newPuzzle);
    setCheckResult("");
    setDifficulty(newLevel);
  };

  const handleReset = () => {
    setBoard(puzzle);
    setCheckResult("");
  };

  const updateCell = (row: number, col: number, value: number | null) => {
    if (fixedCells.has(`${row}-${col}`)) return;

    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? value : cell))
    );
    setBoard(newBoard);
  };

  const getConflictingCells = () => {
    const conflicts = new Set<string>();

    for (let i = 0; i < 9; i++) {
      const rowNums = new Map<number, number[]>();
      const colNums = new Map<number, number[]>();

      for (let j = 0; j < 9; j++) {
        const rowVal = board[i][j];
        const colVal = board[j][i];

        if (rowVal) {
          if (!rowNums.has(rowVal)) rowNums.set(rowVal, []);
          rowNums.get(rowVal)!.push(j);
        }

        if (colVal) {
          if (!colNums.has(colVal)) colNums.set(colVal, []);
          colNums.get(colVal)!.push(j);
        }
      }

      rowNums.forEach((indices) => {
        if (indices.length > 1) {
          indices.forEach((j) => conflicts.add(`${i}-${j}`));
        }
      });

      colNums.forEach((indices) => {
        if (indices.length > 1) {
          indices.forEach((j) => conflicts.add(`${j}-${i}`));
        }
      });
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Map<number, string[]>();

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;
            const val = board[row][col];

            if (val) {
              const key = `${row}-${col}`;
              if (!seen.has(val)) seen.set(val, []);
              seen.get(val)!.push(key);
            }
          }
        }

        seen.forEach((keys) => {
          if (keys.length > 1) {
            keys.forEach((k) => conflicts.add(k));
          }
        });
      }
    }

    return conflicts;
  };

  const conflicts = getConflictingCells();

  const handleCheckSolution = () => {
    if (
      conflicts.size === 0 &&
      board.every((row) => row.every((cell) => cell !== null))
    ) {
      setCheckResult("✅ Puzzle solved correctly!");
    } else {
      setCheckResult("❌ There are conflicts or incomplete cells.");
    }
  };

  const handleSolve = () => {
    const boardCopy = board.map((row) => [...row]);
    if (solveSudoku(boardCopy)) {
      setBoard(boardCopy);
      setCheckResult("✅ Solved!");
    } else {
      setCheckResult("❌ No solution found.");
    }
  };

  const handleHint = () => {
    const boardCopy = board.map((row) => [...row]);
    const solved = board.map((row) => [...row]);

    if (!solveSudoku(solved)) {
      setCheckResult("❌ Cannot provide a hint. Board unsolvable.");
      return;
    }

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const key = `${i}-${j}`;
        if (
          (boardCopy[i][j] === null || boardCopy[i][j] !== solved[i][j]) &&
          !fixedCells.has(key)
        ) {
          boardCopy[i][j] = solved[i][j];
          const newFixed = new Set(fixedCells);
          newFixed.add(key);
          setBoard(boardCopy);
          setFixedCells(newFixed);
          setCheckResult("💡 Hint revealed.");
          return;
        }
      }
    }

    setCheckResult("ℹ️ No more hints available.");
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as "easy" | "medium" | "hard";
    handleGeneratePuzzle(level);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="difficulty" className="font-semibold">
          Difficulty:
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={handleDifficultyChange}
          className="border border-gray-400 rounded px-2 py-1"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="w-fit mx-auto">
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((value, j) => {
              const borderClass = `
                border 
                ${i % 3 === 0 ? "border-t-4" : "border-t"} 
                ${j % 3 === 0 ? "border-l-4" : "border-l"} 
                ${i === 8 ? "border-b-4" : ""} 
                ${j === 8 ? "border-r-4" : ""} 
                border-gray-500
              `;

              return (
                <div className={borderClass} key={`${i}-${j}`}>
                  <SudokuCell
                    value={value}
                    onChange={(val) => updateCell(i, j, val)}
                    isConflict={conflicts.has(`${i}-${j}`)}
                    disabled={fixedCells.has(`${i}-${j}`)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => handleGeneratePuzzle()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Generate New Puzzle
        </button>
        <button
          onClick={handleReset}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
        >
          Reset
        </button>
        <button
          onClick={handleCheckSolution}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Check Solution
        </button>
        <button
          onClick={handleSolve}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Solve
        </button>
        <button
          onClick={handleHint}
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
        >
          Hint
        </button>
      </div>

      {checkResult && <p className="mt-4 text-center text-lg">{checkResult}</p>}
    </div>
  );
};

export default SudokuBoard;
