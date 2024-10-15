# React TinyMCE 게시물 작성하기

## 🔥 이미지 첨부 및 삭제 기능 명세

### 🔷 이미지 첨부

- <b>에디터 내 버튼 클릭</b>

  - 사용자가 에디터 내 이미지 첨부 버튼을 클릭하면 로컬 이미지를 선택하여 S3에 업로드됨.
  - 업로드된 이미지는 게시판 에디터에 렌더링되고, 하단 첨부파일 목록에 추가됨.

- <b>외부 이미지 복사 붙여넣기</b>
  - <b>`인터넷 이미지`</b> : 이미지 URL이 그대로 에디터에 입력됨.
  - <b>`로컬 컴퓨터 이미지`</b> : 이미지가 base64 인코딩되어 에디터에 입력됨.
    - <b>`모든 이미지`</b> : 최종적으로 <b>`S3 버킷 형식의 URL`</b>로 변환되어 저장됨.

### 🔷 이미지 삭제

- <b>에디터 내 이미지 선택 후 스페이스바로 이미지 삭제</b>

  - 서버의 API를 통해 S3에서 해당 이미지를 삭제함.
  - 게시판 에디터에서 이미지가 삭제되고, 하단 첨부파일 목록에서도 제거됨.

- <b>에디터 하단 첨부파일 목록의 'X' 버튼에서 이미지 삭제</b>
  - 서버의 API를 통해 S3에서 해당 이미지를 삭제함.
  - 게시판 에디터에서 이미지가 삭제되고, 하단 첨부파일 목록에서도 제거됨.

### 🔷 브라우저 이미지 압축

---

## 🔥 시퀀스 다이어그램
