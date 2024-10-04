import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function EditorComponent({ content, onContentChange }) {
  const editorRef = useRef(null);

  const insertFile = (url, type) => {
    if (type.startsWith('image/')) {
      // 이미지일 경우
      editorRef.current.insertContent(`<img src="${url}" alt="Uploaded Image" />`);
    } else {
      // 다른 파일일 경우
      editorRef.current.insertContent(`<a href="${url}" target="_blank">파일 다운로드</a>`);
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
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | image',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          setup: (editor) => {
            editor.on('change', () => {
              const newContent = editor.getContent();
              onContentChange(newContent);
            });
          },
        }}
      />
    </>
  );
}