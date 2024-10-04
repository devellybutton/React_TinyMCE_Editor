import { EBoardType } from "../types/EBoardType";

export default function BoardTypeSelector({ boardType, onBoardTypeChange }) {
    return (
      <div className="board-type-buttons">
        {Object.entries(EBoardType).map(([key, value]) => (
          <button key={key} onClick={() => onBoardTypeChange(value)}>
            {key}
          </button>
        ))}
        <p>현재 선택된 게시판 타입: {boardType}</p>
      </div>
    );
  }