import React from 'react';

const PostInput = ({ title, setTitle, hospitalNames, setHospitalNames }) => {
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleHospitalNamesChange = (e) => {
    setHospitalNames(e.target.value);
  };

  return (
    <form>
      <div>
        <label>제목:</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          required
        />
      </div>
      <div>
        <label>병원 이름 (쉼표로 구분):</label>
        <input
          type="text"
          value={hospitalNames}
          onChange={handleHospitalNamesChange}
          required
        />
      </div>
    </form>
  );
};

export default PostInput;
