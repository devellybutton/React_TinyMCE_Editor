import React from 'react';
import styles from '../css/UploadedFiles.module.css';

const UploadedFiles = ({ files }) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className={styles.uploadedFilesContainer}>
      <h3>업로드한 파일 목록</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <span>{file.name}</span> -<span>{file.type}</span> -
            <span>{(file.size / 1024).toFixed(2)} KB</span>
          </li>
        ))}
      </ul>
      <p>총 업로드한 파일 개수: {files.length} (최대 50개)</p>
      <p>총 사용 용량: {(totalSize / 1024).toFixed(2)} KB</p>
    </div>
  );
};

export default UploadedFiles;
