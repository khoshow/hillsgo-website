import { useState, useEffect } from "react";
import Head from "next/head";
// import styles from "../../styles/Home.module.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { db, storage } from "../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getServerSideProps(context) {
  const { id } = context.params;

  let workerData = null;

  try {
    const workerRef = doc(db, "workers", id);
    const workerSnap = await getDoc(workerRef);

    if (workerSnap.exists()) {
      const data = workerSnap.data();

      workerData = {
        ...data,
        id,
        createdAt: data.createdAt?.toDate().toISOString() || null, // 🧠 convert Firestore Timestamp to string
        editedAt: data.editedAt?.toDate().toISOString() || null,
      };
    }
  } catch (error) {
    console.error("Error fetching worker:", error);
  }

  return {
    props: {
      workerData,
    },
  };
}

export default function WorkerPage({ workerData }) {
  useEffect(() => {
    if (!workerData?.id) return;

    const hasTried = sessionStorage.getItem("hillsgo_deep_link_tried");
    if (hasTried) return;

    sessionStorage.setItem("hillsgo_deep_link_tried", "true");

    const appLink = `hillsgo://worker/${workerData.id}`;

    const fallbackLink = `https://www.hillsgo.com/worker/${workerData.id}`;
    const now = Date.now();

    window.location.href = appLink;

    const timeout = setTimeout(() => {
      const elapsed = Date.now() - now;
      if (elapsed < 1600) {
        window.location.href = fallbackLink;
      }
    }, 1500);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timeout);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [workerData]);

  if (!workerData) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          Worker not found.
        </p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`HillsGo || ${workerData?.workerName}`}</title>
        <meta
          name="description"
          content={workerData?.description || "Hire skilled worker at HillsGO"}
        />
        <meta property="og:title" content={workerData?.workerName} />
        <meta property="og:description" content={workerData?.description} />
        <meta property="og:image" content={workerData?.imageUrl} />
        <meta
          property="og:url"
          content={`https://www.hillsgo.com/worker/${workerData.id}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {workerData?.images?.[0] && (
          <link rel="icon" href={workerData.imageUrl} />
        )}
      </Head>

      <Header />

      <div style={styles.container}>
        <div>
          <div className="table-container">
            <div style={styles.titleBox}>
              <p className="subTitle" style={styles.workerTitle}>
                Worker Details
              </p>

              <img
                src={workerData?.imageUrl} // Assuming first image is used for the card
                alt="image detail"
                style={styles.image}
              />
            </div>

            <table>
              <tbody>
                <tr>
                  <th>Worker Name: </th>
                  <td>{workerData?.workerName}</td>
                </tr>

                <tr>
                  <th>Description: </th>
                  <td>{workerData?.workerDescription}</td>
                </tr>

                <tr>
                  <th>State: </th>
                  <td>{workerData?.workerState}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={styles.card}>
            {/* <img
                src="https://res.cloudinary.com/finer-blue/image/upload/v1742214843/HillsGo/logo-circle_ia1anw.png"
                alt="HillsGo Logo"
                style={styles.image}
              /> */}

            <p style={styles.infoText}>
              This worker is currently available for hire only through our
              mobile app. Please download the HillsGo App to get started.
            </p>

            <a
              href="https://play.google.com/store/apps/details?id=com.hillsgo.hillsgoapp"
              target="_blank"
              style={styles.button}
            >
              Download HillsGO
            </a>
          </div>
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
  infoText: {
    backgroundColor: "#f0f4ff",
    borderLeft: "4px solid #3b82f6",
    padding: "1rem",
    margin: "1.5rem 0",
    fontSize: "16px",
    lineHeight: "1.6",
    borderRadius: "8px",
    color: "#1e3a8a",
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
  imageLogo: {
    width: "80px", // Adjust size as needed
    height: "80px",
    objectFit: "contain",
    marginBottom: "1rem",
  },
  image: {
    width: "200px",
    height: "auto",
    objectFit: "cover",
    marginBottom: "5px",
    // margin: "0 auto",
    // justifyContent: "center",
    // textAlign: "center",
    borderRadius: "10px",
    display: "block",
    // margin: "0 auto 2rem",
  },
  workerTitle: {
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  titleBox: {
    marginBottom: "1.5rem",
  },
};
