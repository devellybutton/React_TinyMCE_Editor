import React, { useState } from 'react';
import { EBoardType } from '../types/EBoardType';
import EditorComponent from './EditorComponent';
import FileUpload from './FileUpload.jsx';
import BoardTypeSelector from './BoardTypeSelector';
import PostInput from './PostInput.jsx';
import { createPost } from '../api/request.js';

export default function App() {
  const [boardType, setBoardType] = useState(EBoardType.EMPLOYMENT);
  const [content, setContent] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [hospitalNames, setHospitalNames] = useState([]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleFileUpload = (url) => {
    setFileUrls((prev) => [...prev, url]);
  };

  const handleFileDelete = (url) => {
    setFileUrls((prev) => prev.filter((fileUrl) => fileUrl !== url));
  };

  const handlePostSubmit = async () => {
    const hospitalArray = typeof hospitalNames === 'string' && hospitalNames.length > 0
      ? hospitalNames.split(',').map((name) => name.trim())
      : [];

    const requestBody = {
      title,
      content,
      fileUrls,
      hospitalNames: hospitalArray,
    };

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
      }
    } catch (error) {
      console.error('게시글 작성 중 오류:', error);
    }
  };

  return (
    <>
      <button onClick={handlePostSubmit}>게시물 작성</button>
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
      />
      <FileUpload boardType={boardType} onFileUpload={handleFileUpload} />
    </>
  );
}
