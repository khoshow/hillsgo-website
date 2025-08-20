import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase/firebase";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";

export default function EditCategory() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      try {
        const docRef = doc(db, "estoresCategories", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setName(data.name || "");
          setIconImage(data.iconImage || "");
          setBannerImage(data.bannerImage || "");
        } else {
          setMessage("Category not found.");
        }
      } catch (error) {
        console.error("Error fetching category: ", error);
        setMessage("Error loading category.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const docRef = doc(db, "estoresCategories", id);
      await updateDoc(docRef, {
        name,
        categoryId: name.toLowerCase().replace(/\s+/g, "-"), // keep slug updated
        iconImage,
        bannerImage,
        updatedAt: new Date(),
      });

      setMessage("Category updated successfully.");
    } catch (error) {
      console.error("Error updating category: ", error);
      setMessage("Error updating category.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Admin>
        <AdminLayout>
          <Header />
          <div style={styles.container}>
            <p>Loading category...</p>
          </div>
        </AdminLayout>
      </Admin>
    );
  }

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 className="text-2xl font-bold mb-6">Edit Category</h1>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Icon Image URL</label>
              <input
                type="url"
                value={iconImage}
                onChange={(e) => setIconImage(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Banner Image URL</label>
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? "Saving..." : "Update Category"}
            </button>
          </form>

          {message && <p className="mt-4">{message}</p>}
        </div>
      </AdminLayout>
    </Admin>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Arial', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "0.3rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f9fa",
  },
  button: {
    padding: "0.7rem",
    fontSize: "16px",
    borderRadius: "4px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};
