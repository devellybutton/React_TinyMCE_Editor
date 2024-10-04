import React, { useState } from 'react';
import { EBoardType } from '../types/EBoardType';
import EditorComponent from './EditorComponent';
import FileUpload from './FileUpload';
import BoardTypeSelector from './BoardTypeSelector';

export default function App() {
  const [boardType, setBoardType] = useState(EBoardType.EMPLOYMENT);
  const [content, setContent] = useState("<p>This is the initial content of the editor.</p>");

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleFileUpload = (url, type) => {
    console.log("확인용 출력) S3에 저장된 URL", url)

    setContent((prevContent) => {
      if (type.startsWith('image/')) {
        return prevContent + `<img src="${url}" alt="업로드한 이미지" />`;
      } else {
        return prevContent + `<a href="${url}" target="_blank">파일 다운로드</a>`;
      }
    });
  };

  return (
    <>
      <BoardTypeSelector 
        boardType={boardType}
        onBoardTypeChange={setBoardType} 
      />
      <EditorComponent 
        content={content} 
        onContentChange={handleContentChange} 
      />
      <FileUpload boardType={boardType} onFileUpload={handleFileUpload}/>
    </>
  );
}