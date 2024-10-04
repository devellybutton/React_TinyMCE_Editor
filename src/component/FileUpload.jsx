import React, { useState } from 'react';
import styles from '../css/FileUpload.module.css';

export default function FileUpload({ boardType, onFileUpload }) {
  const [file, setFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // 이미지 미리보기 URL 생성
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setUploadedFileUrl(url);
    } else {
      setUploadedFileUrl(''); // 이미지가 아닐 경우 URL 초기화
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('업로드할 파일을 선택해 주세요.');
      return;
    }

    // 1. 서버에서 presigned URL 가져오기
    const presignedResponse = await fetch('http://localhost:3000/files/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!presignedResponse.ok) {
      alert('Presigned URL을 가져오는 데 오류가 발생하였습니다.');
      return;
    }

    const responseData = await presignedResponse.json();
    const { url, fields } = responseData;

    const formData = new FormData();
    formData.append('Content-Type', file.type);
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    // 2. S3 버킷에 해당 파일 업로드하기
    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      alert('파일이 성공적으로 업로드되었습니다!');

      const fileUrl = `${url}${fields['key']}`;

      // console.log('S3 URL:', fileUrl); 
      
      setUploadedFileUrl(fileUrl);
      onFileUpload(fileUrl, file.type);
    } else {
      alert('파일 업로드에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>S3 버킷에 파일 업로드</button>
      {uploadedFileUrl && file && file.type.startsWith('image/') && (
        <div className={styles.previewBox}>
          <p>미리보기:</p>
          <img src={uploadedFileUrl} alt="미리보기" style={{ maxWidth: '300px', maxHeight: '300px' }} />
        </div>
      )}
    </div>
  );
}