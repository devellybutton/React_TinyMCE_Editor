import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import uploadFileToS3 from './fileUpload';
import UploadedFiles from './UploadedFiles';
import compressImage from '../utils/compress-image';
import { API_FILE_URL } from '../api';
import { debounce } from 'lodash';

export default function EditorComponent({
  content,
  onContentChange,
  onFileUpload,
  onFileDelete,
  fileUrls,
  editorRef,
  uploadedFiles,
  setUploadedFiles,
}) {
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

  const handleFileDelete = async (url) => {
    try {
      const encodedFileURL = encodeURIComponent(url);
      await fetch(`${API_FILE_URL}/${encodedFileURL}`, { method: 'DELETE' });

      // 에디터 내용에서 해당 이미지 삭제
      const newContent = content.replace(
        new RegExp(`<img src="${url}" alt=".*?" />`, 'g'),
        ''
      );

      // editorRef가 null이 아닐 때만 setContent 호출
      if (editorRef.current) {
        editorRef.current.setContent(newContent);
        onContentChange(newContent);
      } else {
        console.error('Editor reference is not initialized.');
      }

      // 업로드된 파일 목록에서 제거
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((file) => file.url !== url)
      );

      // 부모 컴포넌트에도 파일 삭제 알림
      onFileDelete(url);
    } catch (error) {
      console.error('파일 삭제 중 오류 발생:', error);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  // 게시글 에디터에서 change 이벤트 처리
  useEffect(() => {
    if (!editorRef.current) return;

    const handleChange = debounce(() => {
      const currentContent = editorRef.current.getContent();
      const imgTags = [...editorRef.current.getBody().querySelectorAll('img')];
      const currentImageUrls = imgTags.map((img) => img.src);

      // 삭제된 이미지 URL 확인
      const deletedImageUrls = uploadedFiles
        .map((file) => file.url)
        .filter((url) => !currentImageUrls.includes(url));

      if (deletedImageUrls.length > 0) {
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => !deletedImageUrls.includes(file.url))
        );

        deletedImageUrls.forEach((url) => onFileDelete(url));
      }

      // 에디터 내용 변경시 상태 업데이트
      // 스페이스바로 이미지를 지운 후에도 이미지가 다시 나타나는 문제를 방지
      // 에디터 초기화를 잘못해서 그런지는 모르겠는데 가끔 커서가 에디터 맨 위쪽으로 이동하고, 삭제된 이미지가 리렌더링됨.
      onContentChange(currentContent);
    }, 300);

    editorRef.current.on('change', handleChange);

    return () => {
      editorRef.current.off('change', handleChange);
    };
  }, [content, fileUrls, uploadedFiles]);

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
                  const fileUrl = await handleFileUpload(
                    compressedFile || file
                  );

                  // URL이 유효한지 확인
                  if (fileUrl) {
                    const currentContent = editorRef.current.getContent();
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
            editor.on('paste', async (event) => {
              const items = event.clipboardData.items;
              let isImageInNow = false;

              for (const item of items) {
                if (item.type.startsWith('image/')) {
                  isImageInNow = true;
                  const file = item.getAsFile();
                  const compressedFile = await compressImage(file);
                  const fileUrl = await handleFileUpload(compressedFile);

                  if (fileUrl) {
                    const currentContent = editor.getContent();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(
                      currentContent,
                      'text/html'
                    );

                    // base64 이미지 찾기
                    const base64Images = doc.querySelectorAll(
                      'img[src^="data:image/"]'
                    );
                    base64Images.forEach((img) => {
                      // S3 URL로 교체
                      img.src = fileUrl;
                      img.alt = file.name;
                    });

                    const newContent = doc.body.innerHTML;
                    editor.setContent(newContent);
                    onContentChange(newContent);
                    onFileUpload(fileUrl);
                  }
                  event.preventDefault();
                  break;
                }
              }

              if (!isImageInNow) {
                event.preventDefault();
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
