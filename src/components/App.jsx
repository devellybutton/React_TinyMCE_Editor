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

  // 사용자가 직접 html의 input 태그로 업로드한 경우
  const handleFileUpload = (url, type) => {
    console.log('확인용) S3에 저장된 URL: ', url);

    setFileUrls((prev) => [...prev, url]);

    setContent((prevContent) => {
      if (type.startsWith('image/')) {
        return prevContent + `<img src="${url}" alt="업로드한 이미지" />`;
      } else {
        return (
          prevContent + `<a href="${url}" target="_blank">파일 다운로드</a>`
        );
      }
    });
  };

  const handlePostSubmit = async () => {
    const requestBody = {
      title,
      content,
      fileUrls,
      hospitalNames,
    };

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
      <button onClick={() => handlePostSubmit(title, hospitalNames)}>
        게시물 작성
      </button>
      <BoardTypeSelector
        boardType={boardType}
        onBoardTypeChange={setBoardType}
      />
      <PostInput
        onSubmit={(newTitle, newHospitalNames) => {
          setTitle(newTitle);
          setHospitalNames(newHospitalNames);
        }}
      />
      <EditorComponent
        content={content}
        onContentChange={handleContentChange}
      />
      <FileUpload boardType={boardType} onFileUpload={handleFileUpload} />
    </>
  );
}
