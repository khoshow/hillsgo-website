import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Lottie from "lottie-react";
import Footer from "@/components/Footer";
import Image from "next/image";

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
      <div style={styles2.container}>
        <main className={styles.main}>
          <section className={styles.hero}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>HillsGO</h2>
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
            </p>

            <div
              style={{
                color: "black",
                fontSize: "1.2rem",
                textAlign: "center",
              }}
            >
              <p>Get the App on PlayStore</p>
              <img
                src="https://res.cloudinary.com/finer-blue/image/upload/v1739190431/HillsGo/qrcode-page2_rqnlmw.png"
                alt="Download App"
                width={300}
                height={349}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <a
                href="https://play.google.com/store/apps/details?id=com.hillsgo.hillsgoapp"
                style={{ color: "#0070f3" }}
              >
                Download Link
              </a>
            </div>
            {/* 
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1rem", color: "#777" }}>
                contact@hillsgo.com
              </p>
            </div> */}
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}

const styles2 = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    flex: 1,
  },
};
