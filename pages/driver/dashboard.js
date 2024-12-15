import Head from "next/head";
import styles from "../../styles/Home.module.css";
import Header from "../../components/Header";
import Lottie from "lottie-react";
import run_scooty from "../../public/assets/animations/run_scooty.json";
import Driver from "@/components/auth/Driver";
import DriverLayout from "@/components/layout/DriverLayout";

export default function Home() {
  return (
    <Driver>
      <DriverLayout>
        <Head>
          <title>HillsGo || Driver Dashboard </title>
          <meta name="description" content="HillsGo || Driver Page" />
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
              }}
            >
              Driver Dashboard
            </p>

            {/* <div style={{ width: 200, height: 200, marginBottom: "1.5rem" }}>
            <Lottie animationData={run_scooty} loop={true} />
          </div> */}
          </section>
        </main>
      </DriverLayout>
    </Driver>
  );
}
