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
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";

let api;
if (process.env.NEXT_PUBLIC_NODE_ENV == "production") {
  api =
    "https://seahorse-app-pir2f.ondigitalocean.app/api/estore/create-thumbnail-estore-web";
} else if (process.env.NEXT_PUBLIC_NODE_ENV == "development") {
  api = "http://localhost:8000/api/estore/create-thumbnail-estore-web";
}

export default function MyEstores() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [estores, setEstores] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;

    fetchEstores();
  }, [user, router]);

  const fetchEstores = async () => {
    if (!user) {
      router.push("/"); // Redirect if not logged in
      return;
    }

    try {
      const estoresQuery = query(
        collection(db, "estores")
        // where("ownerId", "==", user.uid) // Fetch estores created by the logged-in user
      );

      const querySnapshot = await getDocs(estoresQuery);
      const estoreList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEstores(estoreList); // Update state with fetched estores
    } catch (error) {
      console.error("Error fetching estores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGotThumbnail = async () => {
    alert("Thumbnail Present");
  };
  const handleCreateThumbnail = async (estoreId) => {
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estoreId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      alert("Thumbnail created: successfully");
      fetchEstores();
    } catch (err) {
      console.error(err);
      alert("Thumbnail creation failed: " + err.message);
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
          <h1>Estores</h1>
          <div style={styles.estoreGrid}>
            {estores.length > 0 ? (
              estores.map((estore) => (
                <div key={estore.id} style={styles.estoreCard}>
                  <img
                    src={estore.imageUrl} // Assuming first image is used for the card
                    alt={estore.name}
                    style={styles.image}
                  />
                  <h3 style={styles.estoreName}>{estore.estoreName}</h3>

                  <p style={styles.estoreDescription}>
                    Address: {estore.estoreAddress}
                  </p>
                  <p style={styles.estoreDescription}>
                    Owner: {estore.ownerName}
                  </p>
                  <div>
                    <button
                      style={styles.editButton}
                      onClick={() =>
                        router.push(
                          `/admin/estores/edit-estore?id=${estore.id}`
                        )
                      }
                    >
                      Edit
                    </button>
                    <button
                      style={styles.editButton}
                      onClick={() =>
                        router.push(
                          `/admin/estores/estore-products?id=${estore.ownerId}`
                        )
                      }
                    >
                      View Products
                    </button>
                    {estore.thumbnailPresent ? (
                      <button
                        style={styles.editButton1}
                        onClick={() => handleGotThumbnail(estore.id)}
                      >
                        Thumbnail Present
                      </button>
                    ) : (
                      <button
                        style={styles.editButton}
                        onClick={() => handleCreateThumbnail(estore.id)}
                      >
                        Create Thumbnail
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No estores found.</p>
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
  estoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  estoreCard: {
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
  estoreName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  estorePrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  estoreDescription: {
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
    marginTop: "20px",
  },
  editButton1: {
    marginRight: "10px",
    backgroundColor: "#a07b15ff",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
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
