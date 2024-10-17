import imageCompression from 'browser-image-compression';

const compressImage = async (file) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      // console.log(file instanceof Blob);
      // console.log(file instanceof File);
      console.log('★★★★★★이미지 압축 전★★★★★★');
      console.log('파일의 타입: ', file.type);
      console.log('original width: ', img.width, img.height);
      console.log('original size: ', file.size);

      const options = {
        maxSizeMB: 10, // 최대 파일 크기
        maxWidthOrHeight: 1920, // 최대 가로/세로 길이 1920px
        useWebWorker: true,
        initialQuality: 0.7,
      };

      if (
        file.size > 1 * 1024 * 1024 ||
        img.width > 1920 ||
        img.height > 1920
      ) {
        try {
          // 압축 전 파일을 blob으로 변환
          let fileToCompress = file;
          if (!(file instanceof Blob)) {
            // 변환 전 파일의 타입을 blob에 넣어주고, 없을 경우 image/jpeg로 넣어줌.
            fileToCompress = new Blob([file], {
              type: `${file.type}` || 'image/jpeg',
            });
          }

          // 파일 압축
          const compressedFile = await imageCompression(
            fileToCompress,
            options
          );

          // 압축 후 파일 크기 확인
          if (compressedFile.size > 10 * 1024 * 1024) {
            alert('압축 후 파일 크기가 10MB를 초과합니다.');
            reject(new Error('압축 후 파일 크기가 10MB를 초과합니다.'));
            return;
          }

          // 다시 Image 객체로 로드하여 width와 height 확인
          // 이미지로 변환 안 하면 undefined 뜸.
          const compressedImg = new Image();
          compressedImg.src = URL.createObjectURL(compressedFile);

          compressedImg.onload = () => {
            console.log('★★★★★★이미지 압축 후★★★★★★');
            console.log(
              'compressedFile의 width와 height: ',
              compressedImg.width,
              compressedImg.height
            );
            console.log('compressedFile.size', compressedFile.size);
            resolve(compressedFile);
          };
        } catch (error) {
          console.error('이미지 압축 중 오류 발생:', error);
          alert('이미지 압축 중 오류가 발생했습니다. 다시 시도해주세요.');
          reject(error);
        }
      } else {
        resolve(file);
      }
    };
  });
};

export default compressImage;
