import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import uploadFileToS3 from './fileUpload';
import UploadedFiles from './UploadedFiles';

export default function EditorComponent({ content, onContentChange }) {
  const editorRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (file) => {
    try {
      const fileUrl = await uploadFileToS3(file);

      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        { name: file.name, type: file.type, size: file.size, url: fileUrl },
      ]);
      return fileUrl;
    } catch (error) {
      alert(error.message);
      return null;
    }
  };

  return (
    <>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue={content}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'code',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | link image | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | wordcount',
          file_picker_types: 'file image media',
          file_picker_callback: (cb, value, meta) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute(
              'accept',
              'image/gif, image/png, image/jpeg, image/jpg'
            );

            input.addEventListener('change', async (e) => {
              const file = e.target.files[0];
              const reader = new FileReader();

              reader.onload = function () {
                cb(reader.result, { title: 'hola' });
              };
              if (file) {
                try {
                  // S3에 파일 업로드 및 URL 획득
                  const fileUrl = await handleFileUpload(file);

                  // URL이 유효한지 확인
                  if (fileUrl) {
                    const currentContent = editorRef.current.getContent();

                    // S3 URL을 에디터에 삽입
                    // 기본적으로 설정을 안하면 base64로 인코딩된 데이터가 content 안으로 들어감.
                    const newContent = `${currentContent}<img src="${fileUrl}" alt="${file.name}" />`;

                    // 에디터의 내용을 업데이트
                    editorRef.current.setContent(newContent);
                    onContentChange(newContent);
                  } else {
                    console.error('파일 URL이 유효하지 않습니다.');
                  }
                } catch (error) {
                  console.error('파일 업로드 중 오류 발생:', error); 
                  alert(error.message);
                }
              } else {
                console.warn('파일이 선택되지 않았습니다.');
              }
            });

            input.click();
          },
          block_unsupported_drop: false,
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          setup: (editor) => {
            editor.on('change', () => {
              const newContent = editor.getContent();
              onContentChange(newContent);
            });
          },
        }}
      />
      {/* 업로드한 파일 목록 표시 */}
      <UploadedFiles files={uploadedFiles} />
    </>
  );
}
