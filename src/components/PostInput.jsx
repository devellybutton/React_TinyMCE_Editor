import React from 'react';
import styles from '../css/PostInput.module.css';

const PostInput = ({ title, setTitle, hospitalNames, setHospitalNames }) => {
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleHospitalNamesChange = (e) => {
    setHospitalNames(e.target.value);
  };

  return (
    <form className={styles.form}>
      <div className={styles.formDiv}>
        <label className={styles.label}>제목:</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className={styles.input}
          required
        />
      </div>
      <div className={styles.formDiv}>
        <label className={styles.label}>병원 이름 (쉼표로 구분):</label>
        <input
          type="text"
          value={hospitalNames}
          onChange={handleHospitalNamesChange}
          className={styles.input}
          required
        />
      </div>
    </form>
  );
};

export default PostInput;
