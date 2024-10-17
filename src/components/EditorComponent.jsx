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
  const handleEditorInit = (editor) => {
    editorRef.current = editor;
  };

  /**
   * 파일을 S3에 업로드하고 업로드된 파일의 S3 URL을 반환
   * @param {File} file - 업로드할 파일
   * @returns {Promise<string | null>} - 파일 URL 또는 오류 시 null
   */

  const handleFileUpload = async (file) => {
    try {
      const fileUrl = await uploadFileToS3(file);

      if (fileUrl) {
        const { name, type, size } = file.file;
        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          { name, type, size, url: fileUrl },
        ]);
        return fileUrl;
      }
    } catch (error) {
      alert(error.message);
    }
    return null;
  };

  /**
   * 게시판 에디터의 내용을 업데이트하고 부모 컴포넌트에 변경 사항을 알림
   * @param {string} newContent - 새 에디터 내용
   */
  const updateEditorContent = (newContent, fileUrl) => {
    // HTML 태그를 제거하고 글자 수를 계산
    const plainTextLength = newContent.replace(/<[^>]+>/g, '').length;

    // 본문의 글자수가 5000자가 넘어가면 경고 알람을 전송
    if (plainTextLength > 5000) {
      alert('글자수는 5000자를 초과할 수 없습니다.');
      return;
    }

    if (editorRef.current) {
      editorRef.current.setContent(newContent);
      onContentChange(newContent);
      if (fileUrl) {
        onFileUpload(fileUrl);
      }
    } else {
      console.log('에디터가 초기화되지 않았습니다.');
    }
  };

  /**
   * 특정 URL의 파일을 삭제하고 에디터 내용 및 상태를 업데이트함.
   * @param {string} url - 삭제할 파일의 S3 URL
   */
  const handleFileDelete = async (url) => {
    try {
      const encodedFileURL = encodeURIComponent(url);
      await fetch(`${API_FILE_URL}/${encodedFileURL}`, { method: 'DELETE' });

      // 에디터 내용에서 해당 이미지 삭제
      const newContent = content.replace(
        new RegExp(
          `<img src="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`,
          'g'
        ),
        ''
      );

      // 에디터 내용 업데이트
      updateEditorContent(newContent);

      // 업로드된 파일 목록에서 해당 파일을 제거
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

  /**
   * 클립보드에서 이미지를 붙여넣을 때 처리하는 함수
   * @param {ClipboardEvent} event - 붙여넣기 이벤트
   */
  const handleImagePaste = async (event) => {
    const items = event.clipboardData.items;
    let isImageInNow = false;

    for (const item of items) {
      /****************************************** 
        복붙한 이미지 파일의 타입이 'image/XXX'일 때 
        ******************************************/
      if (item.type.startsWith('image/')) {
        console.log('붙여넣기 이미지 처리 시작');
        isImageInNow = true;
        const file = item.getAsFile();
        const compressedFile = await compressImage(file);
        const fileUrl = await handleFileUpload(compressedFile);

        if (fileUrl) {
          const currentContent = editorRef.current.getContent();
          const newContent = updateImageContent(
            currentContent,
            fileUrl,
            file.name
          );
          updateEditorContent(newContent, fileUrl);
          onFileUpload(fileUrl);
        }
        event.preventDefault();
        break;
      } else if (item.type === 'text/uri-list') {
        /****************************************** 
          복붙한 이미지가 이미지 파일이 아니라 텍스트(링크)일 때 
          ******************************************/
        const url = await navigator.clipboard.readText();
        if (url.startsWith('http')) {
          console.log('링크에서 이미지 가져오기 시작', url);
          const response = await fetch(url);
          const blob = await response.blob();
          const compressedFile = await compressImage(blob);
          const fileUrl = await handleFileUpload(compressedFile);

          if (fileUrl) {
            const currentContent = editorRef.current.getContent();
            const newContent = updateImageContent(
              currentContent,
              fileUrl,
              '외부 웹 링크에서 가져온 이미지'
            );
            updateEditorContent(newContent, fileUrl);
            onFileUpload(fileUrl);
          }
          event.preventDefault();
          break;
        }
      }
    }

    if (!isImageInNow) {
      event.preventDefault();
    }
  };

  /**
   * 에디터 내용의 이미지를 S3 파일 URL로 변경하는 함수
   * (데이터 일관성을 위해 에디터에 넣은 이미지를 모두 S3에 저장하고 html에는 S3 URL을 넣음.)
   * @param {string} currentContent - 현재 에디터 내용
   * @param {string} fileUrl - 새 파일 URL
   * @param {string} altText - 이미지에 대한 alt 텍스트
   * @returns {string} - 업데이트된 에디터 내용
   */
  const updateImageContent = (currentContent, fileUrl, altText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentContent, 'text/html');

    // base64 이미지를 S3 파일 URL로 변경
    const base64Images = doc.querySelectorAll('img[src^="data:image/"]');
    base64Images.forEach((img) => {
      img.src = fileUrl;
      img.alt = altText;
    });

    // 외부 링크 이미지를 S3 파일 URL로 변경
    const externalImages = doc.querySelectorAll('img[src^="http"]');
    externalImages.forEach((img) => {
      img.src = fileUrl;
      img.alt = altText;
    });

    return doc.body.innerHTML;
  };

  /**
   * 게시글 에디터에서 change 이벤트를 처리
   */
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
        onInit={(_evt, editor) => {
          handleEditorInit(editor);
        }}
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
            /****************************************** 
            에디터 내 그림 아이콘 클릭해서 로컬 컴퓨터에서 이미지 첨부한 경우 
            ******************************************/
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            // 허용할 이미지 파일 타입: gif, png, jpeg, jpg
            input.setAttribute(
              'accept',
              'image/gif, image/png, image/jpeg, image/jpg'
            );

            input.addEventListener('change', async (e) => {
              const file = e.target.files[0];

              if (!file) {
                console.log('파일 선택이 취소되었습니다.');
                return; // 아무것도 하지 않고 종료
              }

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

                  console.log('fileurl', fileUrl);

                  // URL이 유효한지 확인
                  if (fileUrl) {
                    // 모달창에 source : S3 URL, width 및 height: 자동 입력
                    cb(fileUrl, {
                      alt: `${compressedFile?.file?.name || '이미지.jpeg'}`,
                      width: `${compressedFile?.width}`,
                      height: `${compressedFile?.height}`,
                      style: 'max-width: 80%; height: auto',
                    });

                    // 이미지 URL 전달
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

            input.addEventListener('blur', () => {
              // 사용자가 파일 선택 대화상자를 취소한 경우 처리
              console.log('파일 선택 대화상자가 닫혔습니다.');
            });

            input.click();
          },
          block_unsupported_drop: false,
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          setup: (editor) => {
            /******************************************
            이미지를 복사 붙여넣기 한 경우
            ******************************************/
            editor.on('paste', handleImagePaste);
          },
        }}
      />
      {/* 업로드한 파일 목록 표시 */}
      <UploadedFiles files={uploadedFiles} onDelete={handleFileDelete} />
    </>
  );
}
