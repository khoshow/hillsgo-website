import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebase/firebase"; // Import your Firestore config
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Admin
import Admin from "@/components/auth/Admin";

export default function MyProducts() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id, ownerId } = router.query;
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;

    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    if (!user) {
      router.push("/"); // Redirect if not logged in
      return;
    }

    try {
      const productsQuery = query(collection(db, "outOfStockProductsEstores"));

      const querySnapshot = await getDocs(productsQuery);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productList); // Update state with fetched products
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (productId, imageUrls) => {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      // Delete product document from Firestore
      await deleteDoc(doc(db, "estoreProducts", productId));
      // Delete each image from Firebase Storage
      if (imageUrls) {
        const deletePromises = imageUrls.map(async (url) => {
          const imageName = decodeURIComponent(
            url.substring(url.lastIndexOf("/") + 1, url.indexOf("?"))
          );

          const imageRef = ref(storage, `${imageName}`);
          await deleteObject(imageRef);
        });
        await Promise.all(deletePromises);
      }

      // Update local state to remove deleted product
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete the product.");
    }
  };

  const handleReStock = async (productId) => {
    const confirmed = confirm(
      "Are you sure you want to re-stock this product?"
    );
    if (!confirmed) return;
    try {
      // Step 1: Get the product document
      const productRef = doc(db, "outOfStockProductsEstores", productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();

        // Step 2: Write to new collection with the same ID
        const outOfStockRef = doc(db, "estoreProducts", productId);
        await setDoc(outOfStockRef, productData);
        await deleteDoc(productRef);
        console.log("Product moved to the stocks.");

        alert("Product successfully re-stocked!");
      } else {
        console.warn("Product not found!");
      }
    } catch (error) {
      console.error("Error re-stocking the product:", error);

      alert("Something is wrong!");
    } finally {
      fetchProducts();
    }
  };
  if (loading)
    return (
      <Admin>
        <AdminLayout>
          <Header />
          <p>Loading...</p>
        </AdminLayout>
      </Admin>
    );

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1>My Products</h1>
          <div style={styles.productGrid}>
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} style={styles.productCard}>
                  <img
                    src={product.images[0] ? product.images[0] : "N/A"} // Assuming first image is used for the card
                    alt={product.name ? product.name : "N/A"}
                    style={styles.image}
                  />
                  <h3 style={styles.productName}>
                    {product.name ? product.name : "N/A"}
                  </h3>
                  <p style={styles.productPrice}>
                    MRP: ₹{product.mrp ? product.mrp : "N/A"}
                  </p>
                  <p style={styles.productPrice}>
                    Discount: ₹
                    {product.discountPrice ? product.discountPrice : "N/A"}
                  </p>
                  <p style={styles.productPrice}>
                    SP: ₹{product.price ? product.price.toFixed(2) : "N/A"}
                  </p>
                  <p style={styles.productPrice}>
                    HillsGO Price: ₹
                    {product.wholesalePrice
                      ? product.wholesalePrice.toFixed(2)
                      : "N/A"}
                  </p>
                  <p style={styles.productDescription}>
                    {product.description.length > 100
                      ? `${
                          product.description
                            ? product.description.substring(0, 97)
                            : "N/A"
                        }...`
                      : product.description
                      ? product.description
                      : "N/A"}
                  </p>
                  {/* <button
                    style={styles.editButton}
                    onClick={() =>
                      router.push(
                        `/admin/estores/edit-product?id=${product.id}`
                      )
                    }
                  >
                    Edit
                  </button> */}
                  <button
                    style={styles.editButton}
                    onClick={() => handleReStock(product.id)}
                  >
                    Re-Stock
                  </button>
                  {/* <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(product.id, product.images)}
                  >
                    Delete
                  </button> */}
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "2.5em",
    marginBottom: "20px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  productCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    textAlign: "left",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  productName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  productPrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  productDescription: {
    fontSize: "0.9em",
    color: "#7f8c8d",
  },
  editButton: {
    marginRight: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
