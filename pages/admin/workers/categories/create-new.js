import { useState } from "react";
import { db } from "../../../../firebase/firebase"; // adjust path if needed
import { collection, addDoc } from "firebase/firestore";
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";

export default function CreateCategory() {
  const [name, setName] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const docRef = await addDoc(collection(db, "hireSkillsCategories"), {
        name,
        categoryId: name.toLowerCase().replace(/\s+/g, "-"), // slug-like ID
        iconImage,
        bannerImage,
        createdAt: new Date(),
      });

      setMessage(`Category created: ${name}`);
      setName("");
      setIconImage("");
      setBannerImage("");
    } catch (error) {
      console.error("Error adding category: ", error);
      setMessage("Error creating category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 className="text-2xl font-bold mb-6">
            Create new category for Hire Skills
          </h1>
          <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="64px x 64px <5kb"
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
                placeholder="ratio 2:1 <300kb"
                required
                style={styles.input}
              />
            </div>
            <br></br>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Saving..." : "Create Category"}
            </button>
          </form>

          {message && <p className="mt-4 text-gray-700">{message}</p>}
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
  buttonHover: {
    backgroundColor: "#005bb5",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  success: {
    color: "green",
    textAlign: "center",
  },
  checkboxLabel: {
    display: "flex",

    flexWrap: "wrap",
    margin: "5px 0",
  },
  checkbox: {
    marginRight: "10px",
    display: "flex",
  },
};
