import { useState } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust your import path
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { category } from "@/data/category";

const AdminAddBanner = () => {
  const [formData, setFormData] = useState({
    message: "",
    imageUrl: "",
    bannerUrl: "",
  });

  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const estoreCategories = category;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { message, imageUrl, bannerUrl } = formData;

    try {
      await addDoc(collection(db, "homeBanners"), {
        message,
        imageUrl,
        bannerUrl,
        createdAt: new Date(),
      });

      setLoading(false);
      setSuccess("Added to home banner.");
      alert("Succesfully added to home banner..");
      // Reset form
      setFormData({
        message: "",
        imageUrl: "",
        bannerUrl: "",
      });
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      categories: checked
        ? [...prevData.categories, value]
        : prevData.categories.filter((categoryId) => categoryId !== value),
    }));
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Add Home Banner</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Message:</label>
              <textarea
                type="text"
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Image Link:</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Banner Link:</label>
              <input
                type="text"
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleChange}
                // required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : "Add Home Banner"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
};

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
  title: {
    fontSize: "24px",
    marginBottom: "1rem",
    textAlign: "center",
    color: "#333",
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

// Form fields configuration

export default AdminAddBanner;
