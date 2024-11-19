import React from "react";
import Header from "@/components/Header";
import styles from "../../styles/Home.module.css";

const RequestToDeleteAccount = () => {
  return (
    <>
      <div className={styles.main}>
        <Header />
        <div
          style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
          className="container"
        >
          <h1>Request To Delete Account from HillsGo</h1>

          <p>
            To delete your account from hillsgo app usage, please send your
            email address and name to the following email address
          </p>

          <ul>
            <li>Email: contact@hillsgo.com</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default RequestToDeleteAccount;
