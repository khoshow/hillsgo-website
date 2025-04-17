import { useState, useEffect } from "react";
import Head from "next/head";
// import styles from "../../styles/Home.module.css";
import Header from "../../components/Header";
import Footer from "@/components/Footer";
import { db, storage } from "../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState();
  const [productData, setProductData] = useState();
  let prodId;
  useEffect(() => {
    const path = window.location.pathname;
    const idFromPath = path.split("/")[2];
    if (!idFromPath) return;

    setProductId(idFromPath);
    fetchProduct(idFromPath);

    // Only try opening the app if we haven’t tried recently
    const hasTried = sessionStorage.getItem("hillsgo_deep_link_tried");
    if (hasTried) return;

    // Set the flag so we don't try again this session
    sessionStorage.setItem("hillsgo_deep_link_tried", "true");

    const appLink = `hillsgo://product/${idFromPath}`;
    const fallbackLink = `https://www.hillsgo.com/product/${idFromPath}`;
    // const fallbackLink = `http://localhost:3000/product/${idFromPath}`;
    const now = Date.now();

    // Attempt to open the app
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
  }, []);

  const fetchProduct = async (prodId) => {
    setLoading(true);
    try {
      const productRef = doc(db, "estoreProducts", prodId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        setProductData(productDoc.data());
      } else {
        alert("Product not found!");
        router.push("/"); // Redirect if product not found
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to fetch product details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        {/* <Head>
          <title>{`HillsGo || ${productData?.name || "Product"}`}</title>
          <meta
            name="description"
            content={`HillsGo || ${
              productData?.description || "Discover amazing products"
            }`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {productData?.images?.[0] && (
            <link rel="icon" href={productData.images[0]} />
          )}
        </Head> */}
        <Header />
        <div style={styles.container}>
          <div style={styles.card}>
            <img
              src="https://res.cloudinary.com/finer-blue/image/upload/v1742214843/HillsGo/logo-circle_ia1anw.png"
              alt="HillsGo Logo"
              style={styles.imageLogo}
            />
            <h2 style={styles.heading}>Welcome to HillsGo</h2>
            <p style={styles.text}>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      {productData && (
        <Head>
          <title>{`HillsGo || ${productData?.name || "Product"}`}</title>
          <meta
            name="description"
            content={`HillsGo || ${
              productData?.description || "Discover amazing products"
            }`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {productData?.images?.[0] && (
            <link rel="icon" href={productData.images[0]} />
          )}
        </Head>
      )}
      <Header />
      {productData && (
        <div style={styles.container}>
          <div>
            <div class="table-container">
              <p className="subTitle" style={styles.productTitle}>
                Product Details
              </p>
              <div>
                <img
                  src={productData?.images[0]} // Assuming first image is used for the card
                  alt="image detail"
                  style={styles.image}
                />
              </div>

              <table>
                <tr>
                  <th>Product Name: </th>
                  <td>{productData?.name}</td>
                </tr>
                <tr>
                  <th>Price: </th>
                  <td>₹{productData?.price}</td>
                </tr>
                <tr>
                  <th>Product Description: </th>
                  <td>{productData?.description}</td>
                </tr>
                <tr>
                  <th>Weight: </th>
                  <td>{productData?.weight}</td>
                </tr>
                <tr>
                  <th>Size: </th>
                  <td>{productData?.size}</td>
                </tr>

                <tr>
                  <th>Categories</th>

                  {productData?.categories.map((item, index) => (
                    <td key={index}>{`${item}`} </td>
                  ))}
                </tr>
              </table>
            </div>
            <div style={styles.card}>
              {/* <img
                src="https://res.cloudinary.com/finer-blue/image/upload/v1742214843/HillsGo/logo-circle_ia1anw.png"
                alt="HillsGo Logo"
                style={styles.image}
              /> */}

              <p style={styles.text}>
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
      )}
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
  },
};
