import { API_URL, API_FILE_URL } from '../api';

// 게시글 생성
export const createPost = async (boardType, requestBody) => {
  const response = await fetch(`${API_URL}/${encodeURIComponent(boardType)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (response.status === 201) {
    alert('글쓰기 완료');
    return await response.json();
  } else {
    const error = await response.json();
    console.error('게시글 생성 실패:', error);
    alert(error.message || '게시글 생성 실패');
  }
};

// 게시글 조회
export const getPost = async (boardType, postId) => {
  const response = await fetch(`${API_URL}/${boardType}/${postId}`, {
    method: 'GET',
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    console.error('게시글 조회 실패:', error);
    alert(error.message || '게시글 조회 실패');
  }
};

// 게시글 수정
export const updatePost = async (boardType, postId, requestBody) => {
  const response = await fetch(`${API_URL}/${boardType}/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    alert('게시글 수정 완료');
    return await response.json();
  } else {
    const error = await response.json();
    console.error('게시글 수정 실패:', error);
    alert(error.message || '게시글 수정 실패');
  }
};

// 게시글 삭제
export const deletePost = async (boardType, postId) => {
  const response = await fetch(`${API_URL}/${boardType}/${postId}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    alert('게시글 삭제 완료');
    return await response.json();
  } else {
    const error = await response.json();
    console.error('게시글 삭제 실패:', error);
    alert(error.message || '게시글 삭제 실패');
  }
};

// S3에서 특정 파일 삭제
export const deleteFile = async (url) => {
  const encodedUrl = encodeURIComponent(url); // 인코딩이 필요함.
  const response = await fetch(`${API_FILE_URL}/${encodedUrl}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('파일 삭제에 실패했습니다.');
  }

  return await response.json();
};
