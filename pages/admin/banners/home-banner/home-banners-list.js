import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase/firebase"; // Import your Firestore config
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
import { useUser } from "../../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";

export default function HomeBanners() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;
    const fetchBanners = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const bannersQuery = query(
          collection(db, "homeBanners")
          // where("ownerId", "==", user.uid) // Fetch banners created by the logged-in user
        );

        const querySnapshot = await getDocs(bannersQuery);
        const bannerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBanners(bannerList); // Update state with fetched banners
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [user, router]);
  console.log("Prod", banners);

  if (loading)
    return (
      <Admin>
        <AdminLayout>
          <Header />
          <p>Loading...</p>
        </AdminLayout>
      </Admin>
    );

  const handleDeleteBanner = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this banner?");
    if (!confirmed) return;
    console.log("delete", id);
    try {
      await deleteDoc(doc(db, "homeBanners", id));
      alert("Successfully deleted");
    } catch (error) {
      console.log("Unable to Delete");
      alert("Unable to delete");
    }
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 >Home Banners</h1>
          <div style={styles.bannerGrid}>
            {banners.length > 0 ? (
              banners.map((banner) => (
                <div key={banner.id} style={styles.bannerCard}>
                  <img
                    src={banner.imageUrl} // Assuming first image is used for the card
                    alt={banner.name}
                    style={styles.image}
                  />
                  <h3 style={styles.bannerName}>{banner.bannerName}</h3>

                  <p style={styles.bannerDescription}>
                    Message: {banner.message}
                  </p>
                  <p style={styles.bannerDescription}>
                    Banner Link: {banner.bannerUrl}
                  </p>
                  <button
                    style={styles.editButton}
                    onClick={() =>
                      router.push(
                        `/admin/home-banner/edit-banner?id=${banner.id}`
                      )
                    }
                  >
                    Edit
                  </button>
                  <button
                    style={styles.editButton}
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No banners found.</p>
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
  bannerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  bannerCard: {
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
  bannerName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  bannerPrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  bannerDescription: {
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
