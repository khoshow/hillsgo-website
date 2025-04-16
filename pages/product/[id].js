import Head from "next/head";
// import styles from "../../styles/Home.module.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>HillsGo || Contact</title>
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
          <h2 style={styles.heading}>Welcome to HillsGo</h2>
          <p style={styles.text}>
            We&apos;re excited to have you here! Download the HillsGO app to
            explore the products you are looking for.
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.hillsgo.hillsgoapp"
            target="_blank"
            style={styles.button}
          >
            Download the App
          </a>
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
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
    transition: "transform 0.3s ease-in-out",
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    fontWeight: "600",
    color: "#333",
  },
  text: {
    color: "#555",
    marginBottom: "1.5rem",
    fontSize: "1rem",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#007bff", // Primary blue
    color: "#ffffff",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0056b3", // Darker blue on hover
  },
  image: {
    width: "80px", // Adjust size as needed
    height: "80px",
    objectFit: "contain",
    marginBottom: "1rem",
  },
};
