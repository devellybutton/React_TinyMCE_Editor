# React TinyMCE 게시물 작성하기

## 🔥 개요

### 🔷 목적

- TinyMCE를 활용하여 게시글 작성 기능을 구현하고, 이미지 첨부 및 삭제 기능을 설정한 후, 간단한 UI를 구성하여 프로젝트에 도입 전 데모를 진행

### 🔷 설명

- 게시판 카테고리 선택, 제목 입력, 병원 이름 입력, 에디터 본문 작성(이미지 첨부 포함) 후 '작성 버튼' 클릭 시 서버로 게시글 작성 요청이 전송됨.
  - <b>병원 이름 입력</b> : 카카오 API를 활용하여 병원 이름을 검색하고 선택
  - <b>TinyMCE 에디터 본문에 파일 업로드</b> : 추후 이미지 외 파일 업로드도 가능하게 할 예정

<div align="center">

![화면 캡처 2024-10-16 111947](https://github.com/user-attachments/assets/e06d8070-ca16-4c21-8720-6a019e744427)

</div>

---

## 🔥 이미지 첨부 및 삭제 기능 명세

### 🔷 이미지 첨부

- <b>에디터 내 버튼 클릭</b>

  - 사용자가 에디터 내 이미지 첨부 버튼을 클릭하면 로컬 이미지를 선택하여 S3에 업로드됨.
  - 업로드된 이미지는 게시판 에디터에 렌더링되고, 하단 첨부파일 목록에 추가됨.

- <b>외부 이미지 복사 붙여넣기</b>
  - <b>`인터넷 이미지`</b> : 이미지 URL이 그대로 에디터에 입력됨.
  - <b>`로컬 컴퓨터 이미지`</b> : 이미지가 base64 인코딩되어 에디터에 입력됨.
    - <b>`모든 이미지`</b> : 최종적으로 <b>`S3 버킷 형식의 URL`</b>로 변환되어 저장됨.

<details>
<summary><i> [시연 GIF] 이미지 첨부 - 에디터 내 아이콘 클릭하여 로컬 컴퓨터의 이미지 첨부 </i></summary>

![로컬컴퓨터에서이미지업로드-gif](https://github.com/user-attachments/assets/42342025-312c-4596-aa3a-b9473bf1dc55)

</details>
<details>
<summary><i> [시연 GIF] 이미지 첨부 - 인터넷 이미지 복붙하기 </i></summary>

![웹이미지복붙-gif](https://github.com/user-attachments/assets/b4dc7f71-104f-491f-96ce-ef7f1bc07c6d)

</details>
<details>
<summary><i> [시연 GIF] 이미지 첨부 - 로컬 컴퓨터 이미지 복붙하기 </i></summary>

![로컬이미지복붙-gif](https://github.com/user-attachments/assets/58233fe1-4edb-4229-9e41-e1e5f07312ab)

</details>
<br>

### 🔷 이미지 삭제

- <b>에디터 내 이미지 선택 후 백스페이스로 이미지 삭제</b>

  - 서버의 API를 통해 S3에서 해당 이미지를 삭제함.
  - 게시판 에디터에서 이미지가 삭제되고, 하단 첨부파일 목록에서도 제거됨.

- <b>에디터 하단 첨부파일 목록의 'X' 버튼에서 이미지 삭제</b>
  - 서버의 API를 통해 S3에서 해당 이미지를 삭제함.
  - 게시판 에디터에서 이미지가 삭제되고, 하단 첨부파일 목록에서도 제거됨.
  <details>
  <summary><i> [시연 GIF] 이미지 삭제 - 에디터 내 이미지 선택 후 백스페이스 누르기</i></summary>

![스페이스바눌러서삭제-gif](https://github.com/user-attachments/assets/29276bb3-eae9-4000-a4c1-f47abd5ddf2d)

</details>
<details>
<summary><i> [시연 GIF] 이미지 삭제 - 에디터 하단 첨부파일 목록의 'X' 버튼 클릭 </i></summary>

![x버튼눌러서삭제-gif](https://github.com/user-attachments/assets/55f23cee-6e3b-4ec2-942e-969e2c7ab38b)

</details>
<br>

### 🔷 브라우저 이미지 압축

- <b>browser-image-compression 사용</b>

  - 최대 파일 크기 : 10MB
  - 최대 가로 또는 세로 길이 : 1920px
  - WebWorker 사용으로 성능 향상
  - 초기 품질은 70%로 설정

<details>
<summary><i>[시연 GIF] 이미지 브라우저 압축</i></summary>

![브라우저압축-gif](https://github.com/user-attachments/assets/05ee6299-d8b7-4b56-a7e2-143f657a868f)

</details>
<br>

### 🔷 게시물 작성 API POST 요청

- Path Parameter : boardType
- Request Body : title, content, hospitalNames, fileUrls
- userId : 10041004 (임의 설정)
- 본래 쿠키에서 세션 ID를 추출하고, Redis에 세션 ID와 함께 저장된 userId를 MySQL에서 조회함.

<details>
<summary><i>[시연 GIF] 게시물 작성 API 호출 (준비중)</i></summary>



</details>

<details>
<summary><i>[시연 GIF] MySQL에서 해당 게시물 내역 조회 (준비중)</i></summary>



</details>
<details>
<summary><i>[시연 GIF] MySQL에 저장된 게시글 본문 내역 자세히보기 (준비중)</i></summary>



</details>

---

## 🔥 시퀀스 다이어그램

<div align="center">

![image](https://github.com/user-attachments/assets/9012df20-5160-4e66-9458-1fe6c22cd3b8)

</div>
