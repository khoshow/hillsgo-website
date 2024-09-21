import Head from "next/head";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Lottie from "lottie-react";
import run_scooty from "../public/assets/animations/run_scooty.json";

export default function Home() {
  return (
    <>
      <Head>
        <title>HillsGo || Home </title>
        <meta
          name="description"
          content="A beautiful landing page built with Next.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p
            style={{
              color: "black",
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            App based delivery service in Senapati. Coming Soon...
          </p>

          <div style={{ width: 200, height: 200, marginBottom: "1.5rem" }}>
            <Lottie animationData={run_scooty} loop={true} />
          </div>

          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>HillsGo</h2>
            <p style={{ fontSize: "1rem", color: "#555" }}>
              We bring you a little joy
            </p>
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
