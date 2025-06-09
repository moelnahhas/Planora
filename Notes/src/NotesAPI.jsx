import styles from "./NotesAPI.module.css";
import React from 'react';
import Navlogin from "../../welcomepage/src/components/navlogin";
import { useNavigate } from "react-router-dom"; 

function NotesAPI() {
  return (
    <>
    <Navlogin />
      <form action="#">
        <label htmlFor="notes"></label>
        <div className={styles.grid}>
          <textarea id="notes" rows="30" cols="186"></textarea>
        </div>
        <div className={styles.grid}>
          <button
            className={styles.saveButton}
            type="submit"
            value="Save"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
}

export default NotesAPI;
