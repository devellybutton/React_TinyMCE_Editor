import { API_FILE_URL } from '../api';

const uploadFileToS3 = async (file) => {
  // 1. 서버에서 presigned URL 가져오기
  const presignedResponse = await fetch(
    `${API_FILE_URL}/presigned-url`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileType: file.type }),
    }
  );

  if (!presignedResponse.ok) {
    throw new Error('Presigned URL을 가져오는 데 오류가 발생하였습니다.');
  }

  const responseData = await presignedResponse.json();
  const { url, fields } = responseData;

  const formData = new FormData();
  formData.append('Content-Type', file.type);
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);

  // 2. S3에 파일 업로드
  const uploadResponse = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  return `${url}${fields['key']}`; // 파일 URL 반환
};

export default uploadFileToS3;
