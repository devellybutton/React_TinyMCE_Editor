import { EBoardType } from '../types/EBoardType';
import styles from '../css/BoardTypeSelector.module.css';

export default function BoardTypeSelector({ boardType, onBoardTypeChange }) {
  return (
    <div>
      <div className={styles.boardTypeButtons}>
        {Object.entries(EBoardType).map(([key, value]) => (
          <button
            key={key}
            className={styles.button}
            onClick={() => onBoardTypeChange(value)}
          >
            {key}
          </button>
        ))}
      </div>
      <div>
        <p className={styles.selectedBoardType}>
          현재 선택된 게시판: <b>{boardType}</b>
        </p>
      </div>
    </div>
  );
}
