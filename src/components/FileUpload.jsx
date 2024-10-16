import React, { useState } from 'react';
import uploadFileToS3 from './fileUpload';
import styles from '../css/FileUploadComponent.module.css';

const FileUploadComponent = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const fileUrl = await uploadFileToS3(file);
      setSuccessMessage(`업로드 성공: ${fileUrl}`);
      onFileUpload(fileUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.fileUpload}>
      <input
        type="file"
        className={styles.inputFile}
        onChange={handleFileChange}
      />
      <button
        className={styles.buttonUpload}
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
    </div>
  );
};

export default FileUploadComponent;
