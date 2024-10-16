import React, { useState, useRef } from 'react';
import { EBoardType } from '../types/EBoardType';
import EditorComponent from './EditorComponent';
import FileUpload from './FileUpload.jsx';
import BoardTypeSelector from './BoardTypeSelector';
import PostInput from './PostInput.jsx';
import { createPost } from '../api/request.js';
import styles from '../css/App.module.css';
import { API_FILE_URL } from '../api';

export default function App() {
  const [boardType, setBoardType] = useState(EBoardType.EMPLOYMENT);
  const [content, setContent] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [hospitalNames, setHospitalNames] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const editorRef = useRef(null);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleFileUpload = (url) => {
    setFileUrls((prev) => [...prev, url]);
  };

  const handleFileDelete = async (url) => {
    try {
      const encodedFileURL = encodeURIComponent(url);
      await fetch(`${API_FILE_URL}/${encodedFileURL}`, { method: 'DELETE' });

      // 에디터 본문에서 해당 이미지 삭제
      const newContent = content.replace(
        new RegExp(`<img src="${url}" alt=".*?" />`, 'g'),
        ''
      );

      // editorRef가 null이 아닐 때만 setContent 호출
      if (editorRef.current) {
        editorRef.current.setContent(newContent);
        handleContentChange(newContent);
      } else {
        console.error('Editor reference가 초기화되지 않았습니다.');
      }

      setUploadedFiles((prevFiles) =>
        prevFiles.filter((file) => file.url !== url)
      );
    } catch (error) {
      console.error('파일 삭제 중 오류 발생:', error);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  const handlePostSubmit = async () => {
    const hospitalArray =
      typeof hospitalNames === 'string' && hospitalNames.length > 0
        ? hospitalNames.split(',').map((name) => name.trim())
        : [];

    const requestBody = {
      title,
      content,
      fileUrls,
      hospitalNames: hospitalArray,
    };

    console.log('Board Type:', boardType);

    console.log('Title:', title);
    console.log('Content:', content);
    console.log('File URLs:', fileUrls);
    console.log('Hospital Names:', hospitalNames);

    console.log('Request body 내용:', requestBody);
    console.log('Request body size:', JSON.stringify(requestBody).length);

    try {
      const response = await createPost(boardType, requestBody);
      if (response) {
        alert('게시글 작성 완료');
        setTitle('');
        setHospitalNames([]);
        setContent('');
        setFileUrls([]);
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('게시글 작성 중 오류:', error);
    }
  };

  return (
    <>
      <div className={styles.buttonContainer}>
        <button className={styles.submitButton} onClick={handlePostSubmit}>
          게시물 작성
        </button>
      </div>
      <BoardTypeSelector
        boardType={boardType}
        onBoardTypeChange={setBoardType}
      />
      <PostInput
        title={title}
        setTitle={setTitle}
        hospitalNames={hospitalNames}
        setHospitalNames={setHospitalNames}
      />
      <EditorComponent
        content={content}
        onContentChange={handleContentChange}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        fileUrls={fileUrls}
        editorRef={editorRef} 
        uploadedFiles={uploadedFiles} 
        setUploadedFiles={setUploadedFiles}
      />
      <FileUpload boardType={boardType} onFileUpload={handleFileUpload} />
    </>
  );
}
