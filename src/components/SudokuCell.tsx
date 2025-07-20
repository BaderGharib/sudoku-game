import React from "react";

interface SudokuCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isConflict?: boolean;
  disabled?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  onChange,
  isConflict,
  disabled = false,
}) => {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 1 || val > 9) {
      onChange(null);
    } else {
      onChange(val);
    }
  };

  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={handleInput}
      maxLength={1}
      disabled={disabled}
      className={`w-10 h-10 text-center text-lg outline-none
        ${isConflict ? "bg-red-100 text-red-600" : "bg-white"}
        ${disabled ? "bg-gray-200 cursor-not-allowed" : ""}
      `}
    />
  );
};

export default SudokuCell;
