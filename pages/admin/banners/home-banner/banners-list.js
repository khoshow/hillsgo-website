import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";
import { useRouter } from "next/router";

const ListBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "homeBanners"));
        const bannerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBanners(bannerList);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteDoc(doc(db, "homeBanners", id));
        setBanners(banners.filter((banner) => banner.id !== id));
        alert("Banner deleted successfully!");
      } catch (error) {
        console.error("Error deleting banner: ", error);
        alert("Failed to delete banner.");
      }
    }
  };

  if (loading)
    return (
      <Admin>
        <AdminLayout>
          <Header />
          <p>Loading banners...</p>
        </AdminLayout>
      </Admin>
    );

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h2>Home Banners</h2>
          {banners.length === 0 ? (
            <p>No Home banners found.</p>
          ) : (
            <div style={styles.bannerGrid}>
              {banners.map((banner) => (
                <div key={banner.id} style={styles.bannerCard}>
                  <h3>{banner.name}</h3>
                  <p>
                    <strong>Type:</strong> {banner.type}
                  </p>
                  <p>
                    <strong>Start Date:</strong>
                    {banner.startDate?.toDate
                      ? banner.startDate.toDate().toLocaleDateString()
                      : ""}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {banner.endDate?.toDate
                      ? banner.endDate.toDate().toLocaleDateString()
                      : ""}
                  </p>

                  <p>
                    Active:{" "}
                    <span
                      style={{
                        color: banner.isActive ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {banner.isActive ? "Yes" : "No"}
                    </span>
                  </p>
                  {banner.type === "image" ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.name}
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  ) : banner.type === "video" ? (
                    <video
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    >
                      <source src={banner.imageUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : null}

                  <div style={styles.buttonContainer}>
                    <button
                      style={styles.editButton}
                      onClick={() =>
                        router.push(`/admin/banners/home-banner/${banner.id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </Admin>
  );
};

export default ListBanners;

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
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
};
