import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import Admin from "../../components/auth/Admin";
import AdminLayout from "../../components/layout/AdminLayout";
import Header from "../../components/Header";

const addFieldToAllDocumentsPriority = async () => {
  try {
    const estoreProductsRef = collection(db, "estoreProducts");
    const snapshot = await getDocs(estoreProductsRef);

    const updates = snapshot.docs.map(async (document) => {
      const docRef = doc(db, "estoreProducts", document.id);
      return updateDoc(docRef, {
        priority: 1, // Replace with your field name and default value
      });
    });

    await Promise.all(updates);
    console.log("Field priority added to all documents.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

const addFieldToAllDocumentsPurchase = async () => {
  try {
    const estoreProductsRef = collection(db, "estoreProducts");
    const snapshot = await getDocs(estoreProductsRef);

    const updates = snapshot.docs.map(async (document) => {
      const docRef = doc(db, "estoreProducts", document.id);
      return updateDoc(docRef, {
        purchase: 0, // Replace with your field name and default value
      });
    });

    await Promise.all(updates);
    console.log("Field purchase added to all documents.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

const addFieldToAllDocumentsReviews = async () => {
  try {
    const estoreProductsRef = collection(db, "estoreProducts");
    const snapshot = await getDocs(estoreProductsRef);

    const updates = snapshot.docs.map(async (document) => {
      const docRef = doc(db, "estoreProducts", document.id);
      return updateDoc(docRef, {
        reviews: 0, // Replace with your field name and default value
      });
    });

    await Promise.all(updates);
    console.log("Field reviews added to all documents.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

export default function AdminDashboard() {
  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1>Ongoing Orders Management</h1>
          <div style={styles.productGrid}>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => addFieldToAllDocumentsPriority()}
              >
                Add Field priority
              </button>
            </div>
          </div>
          <div style={styles.productGrid}>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => addFieldToAllDocumentsPurchase()}
              >
                Add Field purchase
              </button>
            </div>
          </div>
          <div style={styles.productGrid}>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => addFieldToAllDocumentsReviews()}
              >
                Add Field reviews
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    // textAlign: "center",
  },
  heading: {
    fontSize: "25px",
    marginBottom: "20px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
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
