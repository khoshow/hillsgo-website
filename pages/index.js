import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Lottie from "lottie-react";

export default function Home() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const fetchAnimationData = async () => {
      const response = await fetch("/assets/animations/run_scooty.json");
      const data = await response.json();
      setAnimationData(data);
    };

    fetchAnimationData();
  }, []);
  return (
    <>
      <Head>
        <title>HillsGo || Home </title>
        <meta
          name="description"
          content="HillsGo aims to offer a versatile solution for various delivery needs in the region's growing towns by leveraging technology, real-time tracking, and a customer-centric approach."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>HillsGo</h2>
            {/* <p style={{ fontSize: "1rem", color: "#555" }}>
              We bring you a little joy
            </p> */}
          </div>
          <p
            style={{
              color: "black",
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            To revolutionize the local economy through innovative technology.{" "}
            <br></br>
            Coming Soon...
          </p>

          <div style={{ width: 200, height: 200, marginBottom: "1.5rem" }}>
            {/* <Lottie animationData={animationData} loop={true} /> */}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1rem", color: "#777" }}>
              contact@hillsgo.com
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
