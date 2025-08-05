import Head from "next/head";
// import styles from "../styles/Home.module.css";
import Header from "../components/Header";

import run_scooty from "../public/assets/animations/run_scooty.json";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>HillsGo || Contact </title>
        <meta name="description" content="HillsGo || Contact Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <img
            src="https://res.cloudinary.com/finer-blue/image/upload/v1742214843/HillsGo/logo-circle_ia1anw.png"
            alt="HillsGo Logo"
            style={styles.image}
          />
          <p style={styles.text}>
            <span style={styles.highlight}>Website:</span> www.hillsgo.com
          </p>
          <p style={styles.text}>
            <span style={styles.highlight}>Email:</span> contact@hillsgo.com
          </p>
          <p style={styles.text}>
            <span style={styles.highlight}>Phone:</span> +91-6909-856940
          </p>
          <p style={styles.text}>
            <span style={styles.highlight}>Location:</span> Senapati, Manipur,
            India
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "90vh",
    backgroundColor: "#f8f9fa", // Light grey background
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  text: {
    color: "#333",
    // marginBottom: "0.8rem",
    fontWeight: "500",
  },
  highlight: {
    // color: "#007bff", // Professional blue color
    fontWeight: "600",
  },
  image: {
    width: "80px", // Adjust size as needed
    height: "80px",
    objectFit: "contain",
  },
  // container: {
  //   maxWidth: "900px",
  //   margin: "0 auto",
  //   padding: "20px",
  //   fontFamily: "Arial, sans-serif",
  //   flex: 1,
  // },
};
