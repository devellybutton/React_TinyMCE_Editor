import React, { useState } from 'react';
import uploadFileToS3 from './fileUpload';

const FileUploadComponent = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setError(null); // 파일이 선택되면 에러 메시지를 지움
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
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default FileUploadComponent;
