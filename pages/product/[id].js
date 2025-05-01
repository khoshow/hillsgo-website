import { useState, useEffect } from "react";
import Head from "next/head";
// import styles from "../../styles/Home.module.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { db, storage } from "../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getServerSideProps(context) {
  const { id } = context.params;

  let productData = null;

  try {
    const productRef = doc(db, "estoreProducts", id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const data = productSnap.data();

      productData = {
        ...data,
        id,
        createdAt: data.createdAt?.toDate().toISOString() || null, // 🧠 convert Firestore Timestamp to string
        updatedAt: data.updatedAt?.toDate().toISOString() || null,
      };
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  return {
    props: {
      productData,
    },
  };
}

export default function ProductPage({ productData }) {
  useEffect(() => {
    if (!productData?.id) return;

    const hasTried = sessionStorage.getItem("hillsgo_deep_link_tried");
    if (hasTried) return;

    sessionStorage.setItem("hillsgo_deep_link_tried", "true");

    const appLink = `hillsgo://product/${productData.id}`;
    const fallbackLink = `https://www.hillsgo.com/product/${productData.id}`;
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
  }, [productData]);

  if (!productData) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          Product not found.
        </p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`HillsGo || ${productData?.name}`}</title>
        <meta
          name="description"
          content={productData?.description || "Discover amazing products"}
        />
        <meta property="og:title" content={productData?.name} />
        <meta property="og:description" content={productData?.description} />
        <meta property="og:image" content={productData?.images?.[0]} />
        <meta
          property="og:url"
          content={`https://www.hillsgo.com/product/${productData.id}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {productData?.images?.[0] && (
          <link rel="icon" href={productData.images[0]} />
        )}
      </Head>

      <Header />

      <div style={styles.container}>
        <div>
          <div className="table-container">
            <div style={styles.titleBox}>
              <p className="subTitle" style={styles.productTitle}>
                Product Details
              </p>

              <img
                src={productData?.images[0]} // Assuming first image is used for the card
                alt="image detail"
                style={styles.image}
              />
            </div>

            <table>
              <tbody>
                <tr>
                  <th>Product Name: </th>
                  <td>{productData?.name}</td>
                </tr>
                <tr>
                  <th>Price: </th>
                  <td>₹{productData?.price}</td>
                </tr>
                <tr>
                  <th>Description: </th>
                  <td>{productData?.description}</td>
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
              This product is currently available for purchase only on our
              mobile app. Please download the HillsGo App to view and buy it.
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
  productTitle: {
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  titleBox: {
    marginBottom: "1.5rem",
  },
};
