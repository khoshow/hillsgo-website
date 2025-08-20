import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../../../../firebase/firebase"; // Import your Firestore and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useUser } from "../../../../contexts/UserContext"; // Import your UserContext
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
import Header from "@/components/Header";

export default function EditBanner() {
  const router = useRouter();
  const { user } = useUser(); // Get user from context
  const { id } = router.query; // Get banner ID from query params
  const [bannerData, setBannerData] = useState({
    message: "",
    bannerUrl: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const storage = getStorage();
  useEffect(() => {
    const fetchBanner = async () => {
      if (!user || !id) return; // Redirect if not logged in or ID is missing

      try {
        const bannerRef = doc(db, "homeBanners", id);
        const bannerDoc = await getDoc(bannerRef);

        if (bannerDoc.exists()) {
          setBannerData(bannerDoc.data());
        } else {
          alert("Banner not found!");
          router.push("/home-banners-list"); // Redirect if banner not found
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
        alert("Failed to fetch banner details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [user, id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit updated banner to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("idggg", id);

    if (!user) return;

    setSubmitting(true);
    try {
      // Handle image upload if new images are selected

      // Update banner data in Firestore
      await updateDoc(doc(db, "homeBanners", id), {
        ...bannerData,
        message: bannerData.message,
        imageUrl: bannerData.imageUrl,
        bannerUrl: bannerData.bannerUrl,
      });

      alert("Banner updated successfully!");
      setBannerData({
        message: "",
        imageUrl: "",
        bannerUrl: "",
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner.");
    } finally {
      setSubmitting(false);
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
          <h1 >Edit Banner</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Banner Name:
              <input
                type="text"
                name="message"
                value={bannerData.message}
                onChange={handleInputChange}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Image Url:
              <input
                type="text"
                name="imageUrl"
                value={bannerData.imageUrl}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Banner Link:
              <input
                type="text"
                name="bannerUrl"
                value={bannerData.bannerUrl}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </label>

            <button type="submit" style={styles.button}>
              {submitting ? "Editing Banner..." : "Edit Banner"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  heading: {
    fontSize: "2.5em",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "1.1em",
    marginBottom: "5px",
  },
  discountLabel: {
    backgroundColor: "#95d500",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    height: "100px",
  },
  fileInput: {
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  currentImages: {
    marginTop: "20px",
  },
  image: {
    width: "100px",
    height: "auto",
    marginRight: "10px",
    borderRadius: "5px",
  },
};
