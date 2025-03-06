import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebase/firebase"; // Import your Firworker config
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

export default function MyEstores() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;
    const fetchEstores = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const workersQuery = query(
          collection(db, "workers")
          // where("ownerId", "==", user.uid) // Fetch workers created by the logged-in user
        );

        const querySnapshot = await getDocs(workersQuery);
        const workerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWorkers(workerList); // Update state with fetched workers
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstores();
  }, [user, router]);

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
          <h1 style={styles.heading}>Workers</h1>
          <div style={styles.workerGrid}>
            {workers.length > 0 ? (
              workers.map((worker) => (
                <div key={worker.id} style={styles.workerCard}>
                  <img
                    src={worker.imageUrl} // Assuming first image is used for the card
                    alt={worker.name}
                    style={styles.image}
                  />
                  <h3 style={styles.workerName}>{worker.workerName}</h3>

                  <p style={styles.workerDescription}>
                    Address: {worker.workerAddress}
                  </p>
                  <p style={styles.workerDescription}>
                    Owner: {worker.ownerName}
                  </p>
                  <button
                    style={styles.editButton}
                    onClick={() =>
                      router.push(`/admin/workers/edit-worker?id=${worker.id}`)
                    }
                  >
                    Edit
                  </button>
                </div>
              ))
            ) : (
              <p>No workers found.</p>
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
  workerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  workerCard: {
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
  workerName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  workerPrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  workerDescription: {
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
