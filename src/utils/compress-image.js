// import imageCompression from 'browser-image-compression';

// const compressImage = async (file, editorWidth) => {
//   const img = new Image();
//   img.src = URL.createObjectURL(file);

//   return new Promise((resolve, reject) => {
//     img.onload = async () => {
//       // console.log(file instanceof Blob);
//       // console.log(file instanceof File);
//       console.log('★★★★★★이미지 압축 전★★★★★★');
//       console.log('파일의 타입: ', file.type);
//       console.log('original width: ', img.width, img.height);
//       console.log('original size: ', file.size);
//       console.log('editorWidth', editorWidth)

//       const options = {
//         maxSizeMB: 10, // 최대 파일 크기
//         maxWidthOrHeight: 1920, // 최대 가로/세로 길이 1920px
//         useWebWorker: true,
//         initialQuality: 0.7,
//       };

//       if (
//         file.size > 1 * 1024 * 1024 ||
//         img.width > 1920 ||
//         img.height > 1920
//       ) {
//         try {
//           // 압축 전 파일을 blob으로 변환
//           let fileToCompress = file;
//           if (!(file instanceof Blob)) {
//             // 변환 전 파일의 타입을 blob에 넣어주고, 없을 경우 image/jpeg로 넣어줌.
//             fileToCompress = new Blob([file], {
//               type: `${file.type}` || 'image/jpeg',
//             });
//           }

//           // 파일 압축
//           const compressedFile = await imageCompression(
//             fileToCompress,
//             options
//           );

//           // 압축 후 파일 크기 확인
//           if (compressedFile.size > 10 * 1024 * 1024) {
//             alert('압축 후 파일 크기가 10MB를 초과합니다.');
//             reject(new Error('압축 후 파일 크기가 10MB를 초과합니다.'));
//             return;
//           }

//           // 다시 Image 객체로 로드하여 width와 height 확인 후 반환
//           const compressedImg = new Image();
//           compressedImg.src = URL.createObjectURL(compressedFile);

//           compressedImg.onload = () => {
//             console.log('★★★★★★이미지 압축 후★★★★★★');
//             console.log(
//               'compressedFile의 width와 height: ',
//               compressedImg.width,
//               compressedImg.height
//             );
//             console.log('compressedFile.size', compressedFile.size);

//             let finalWidth = img.width;
//             let finalHeight = img.height;

//             console.log("editorWidth", editorWidth)

//             // 리사이징 로직
//             if (compressedImg.width > editorWidth * 0.8) {
//               finalWidth = editorWidth * 0.8;
//               finalHeight =
//                 (finalWidth / compressedImg.width) * compressedImg.height; // 비율 유지
//             } else {
//               finalWidth = compressedImg.width;
//               finalHeight = compressedImg.height;
//             }

//             resolve({
//               file: compressedFile,
//               width: compressedImg?.width,
//               height: compressedImg?.height,
//             });
//           };
//         } catch (error) {
//           console.error('이미지 압축 중 오류 발생:', error);
//           alert('이미지 압축 중 오류가 발생했습니다. 다시 시도해주세요.');
//           reject(error);
//         }
//       } else {
//         // 리사이징 로직
//         if (img.width > editorWidth * 0.8) {
//           finalWidth = editorWidth * 0.8;
//           finalHeight = (finalWidth / img.width) * img.height; // 비율 유지
//         } else {
//           finalWidth = img.width;
//           finalHeight = img.height;
//         }

//         resolve({ file, width: img?.width, height: img?.height });
//       }
//     };
//   });
// };

// export default compressImage;

import imageCompression from 'browser-image-compression';

const compressImage = async (file, editorWidth) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  // 이미지 로드 후 실행
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  console.log('★★★★★★이미지 압축 전★★★★★★');
  console.log('파일의 타입: ', file.type);
  console.log('original width: ', img.width, img.height);
  console.log('original size: ', file.size);
  console.log('editorWidth', editorWidth);

  const options = {
    maxSizeMB: 10, // 최대 파일 크기
    maxWidthOrHeight: 1920, // 최대 가로/세로 길이 1920px
    useWebWorker: true,
    initialQuality: 0.7,
  };

  // 에디터 너비 동적으로 불러오는게 안 돼서 임의로 설정함.
  editorWidth = 800;

  const resizeImage = (imgWidth, imgHeight) => {
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;

    // 가로는 에디터 너비의 80%, 세로는 비율 맞춰서 조절
    if (imgWidth > editorWidth * 0.8) {
      finalWidth = editorWidth * 0.8;
      finalHeight = (finalWidth / imgWidth) * imgHeight;
    }

    return { finalWidth, finalHeight };
  };

  if (file.size > 1 * 1024 * 1024 || img.width > 1920 || img.height > 1920) {
    try {
      // 압축 전 파일을 blob으로 변환
      const fileToCompress = new Blob([file], {
        type: file.type || 'image/jpeg',
      });

      // 파일 압축
      const compressedFile = await imageCompression(fileToCompress, options);

      // 압축 후 파일 크기 확인
      if (compressedFile.size > 10 * 1024 * 1024) {
        throw new Error('압축 후 파일 크기가 10MB를 초과합니다.');
      }

      console.log('compressedFile', compressedFile);

      // 다시 Image 객체로 로드하여 width와 height 확인 후 반환
      const compressedImg = new Image();
      compressedImg.src = URL.createObjectURL(compressedFile);

      console.log('compressedImg 정보', compressedImg);
      await new Promise((resolve) => {
        compressedImg.onload = resolve;
      });

      console.log('★★★★★★이미지 압축 후★★★★★★');
      console.log(
        'compressedFile의 width와 height: ',
        compressedImg.width,
        compressedImg.height
      );
      console.log('compressedFile.size', compressedFile.size);

      const { finalWidth, finalHeight } = resizeImage(
        compressedImg.width,
        compressedImg.height
      );

      console.log('finalWidth', finalWidth, 'finalHeight', finalHeight);
      return {
        file: compressedFile,
        width: finalWidth,
        height: finalHeight,
      };
    } catch (error) {
      console.error('이미지 압축 중 오류 발생:', error);
      alert('이미지 압축 중 오류가 발생했습니다. 다시 시도해주세요.');
      throw error;
    }
  } else {
    const { finalWidth, finalHeight } = resizeImage(img.width, img.height);
    return { file, width: finalWidth, height: finalHeight };
  }
};

export default compressImage;
