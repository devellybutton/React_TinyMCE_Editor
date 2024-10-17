import React from 'react';
import styles from '../css/UploadedFiles.module.css';

const MAX_FILE_COUNT = 50; // 최대 파일 개수
const MAX_TOTAL_SIZE_MB = 10; // 최대 사용 용량 (MB)
const MAX_TOTAL_SIZE = MAX_TOTAL_SIZE_MB * 1024 * 1024; // 최대 사용 용량 (바이트)

const UploadedFiles = ({ files, onDelete }) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  if (files.length >= MAX_FILE_COUNT) {
    alert(`파일 개수는 최대 ${MAX_FILE_COUNT}개를 초과할 수 없습니다.`);
    return;
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    alert(`총 사용 용량은 최대 ${MAX_TOTAL_SIZE_MB}MB를 초과할 수 없습니다.`);
    return;
  }

  return (
    <div className={styles.uploadedFilesContainer}>
      <h3>업로드한 파일 목록</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index} className={styles.fileItem}>
            <span>{file.name}</span>- <span>{file.type}</span>-{' '}
            <span>{(file.size / 1024).toFixed(2)} KB</span>
            <button onClick={() => onDelete(file.url)}>X</button>
          </li>
        ))}
      </ul>
      <p>총 업로드한 파일 개수: {files.length} (최대 50개)</p>
      <p>총 사용 용량: {(totalSize / 1024).toFixed(2)} KB</p>
    </div>
  );
};

export default UploadedFiles;
