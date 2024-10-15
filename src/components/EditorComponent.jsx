import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import uploadFileToS3 from './fileUpload';
import UploadedFiles from './UploadedFiles';
import compressImage from '../utils/compress-image';
import { API_FILE_URL } from '../api';

export default function EditorComponent({
  content,
  onContentChange,
  onFileUpload,
  onFileDelete,
  fileUrls,
}) {
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

  const handleFileDelete = async (file) => {
    try {
      const encodedFileURL = encodeURIComponent(file.url);
      await fetch(`${API_FILE_URL}/${encodedFileURL}`, {
        method: 'DELETE',
      });

      setUploadedFiles((prevFiles) =>
        prevFiles.filter((item) => item.url !== file.url)
      );

      // 에디터 내용에서 해당 이미지 삭제
      const currentContent = editorRef.current.getContent();
      const newContent = currentContent.replace(
        `<img src="${file.url}" alt="${file.name}" />`,
        ''
      );
      editorRef.current.setContent(newContent);
      onContentChange(newContent);

      onFileDelete(file.url);
    } catch (error) {
      console.error('파일 삭제 중 오류 발생:', error);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      const imgTags = [...editorRef.current.getBody().querySelectorAll('img')];
      const currentImageUrls = imgTags.map((img) => img.src);

      // 현재 업로드된 파일 URL을 배열로 저장
      const currentFileUrls = uploadedFiles.map((file) => file.url);

      // 삭제된 이미지 URL 확인
      const deletedImageUrls = currentFileUrls.filter(
        (url) => !currentImageUrls.includes(url)
      );

      // 삭제된 이미지를 파일 목록에서 제거 및 서버 요청
      deletedImageUrls.forEach((url) => {
        const fileToDelete = uploadedFiles.find((file) => file.url === url);
        if (fileToDelete) {
          handleFileDelete(fileToDelete);
        }
      });
    }
  }, [content, fileUrls]); // content가 변경될 때마다 검사

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

              if (file) {
                try {
                  // 이미지 파일이면 압축
                  let compressedFile;
                  if (file.type.startsWith('image/')) {
                    compressedFile = await compressImage(file);
                  }

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

                    // URL을 App 컴포넌트의 fileUrls에 추가
                    onFileUpload(fileUrl);
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
              if (editorRef.current) {
                const newContent = editor.getContent();
                onContentChange(newContent);

                // 이미지 태그를 찾아서 삭제된 이미지 처리
                const imgTags = [...editor.getBody().querySelectorAll('img')];
                const currentFileUrls = uploadedFiles.map((file) => file.url);

                // 현재 업로드된 파일 URL을 배열로 저장
                const currentImageUrls = imgTags.map((img) => img.src);

                // 삭제된 이미지 URL 확인
                const deletedImageUrls = currentFileUrls.filter(
                  (url) => !currentImageUrls.includes(url)
                );

                // 삭제된 이미지를 파일 목록에서 제거
                setUploadedFiles((prevFiles) =>
                  prevFiles.filter(
                    (file) => !deletedImageUrls.includes(file.url)
                  )
                );
              }
            });
          },
        }}
      />
      {/* 업로드한 파일 목록 표시 */}
      <UploadedFiles files={uploadedFiles} onDelete={handleFileDelete} />
    </>
  );
}
