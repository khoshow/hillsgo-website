import { useState } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust your import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
// import withAuth from "@/lib/isAuth";
import { category } from "@/data/category";

const AdminAddEstore = () => {
  const [formData, setFormData] = useState({
    estoreName: "",
    imageUrl: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    estoreContact: "",
    estoreAddress: "",
    estoreCity: "",
    role: "estore",
    categories: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const estoreCategories = category;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const {
      estoreName,
      imageFile,
      ownerName,
      ownerEmail,
      ownerPassword,
      estoreContact,
      estoreAddress,
      estoreCity,
      role,
      categories,
    } = formData;

    try {
      const ownerCredential = await createUserWithEmailAndPassword(
        auth,
        ownerEmail,
        ownerPassword
      );

      let imageUrl = "";
      if (imageFile) {
        // Upload image to Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, `estores/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const estoreRef = await addDoc(collection(db, "estores"), {
        estoreName,
        imageUrl,
        ownerName,
        ownerEmail,
        ownerId: ownerCredential.user.uid,
        estoreContact,
        estoreAddress,
        estoreCity,
        imageUrl,
        role,
        categories,
        createdAt: new Date(),
      });
      await addEstoreToCategories(estoreRef.id, formData, formData.categories);
      setLoading(false);
      setSuccess("Estore successfully created and owner registered.");
      alert("Estore successfully created and owner registered.");
      setFormData({
        estoreName: "",
        imageUrl: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        estoreContact: "",
        estoreAddress: "",
        estoreCity: "",
        role: "",
        categories: [],
        imageFile: null,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const addEstoreToCategories = async (estoreId, estoreData, categories) => {
    console.log("Adding e-store to categories:", estoreId);

    try {
      for (const category of categories) {
        // Reference to the category document in estoreCategories
        const categoryRef = doc(db, "estoreCategories", category);

        // Check if the category document exists; create it if it doesn’t
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          console.log(`Creating category document for: ${category}`);
          await setDoc(categoryRef, { createdAt: new Date() });
        }

        // Reference to the specific e-store document within the category's stores subcollection
        const estoreRef = doc(categoryRef, "stores", estoreId);

        // Check if the e-store already exists in the category's stores subcollection
        const estoreDoc = await getDoc(estoreRef);
        if (!estoreDoc.exists()) {
          // Add the e-store document if it doesn’t exist in this category
          await setDoc(estoreRef, estoreData);
          console.log(`Added e-store ${estoreId} to category: ${category}`);
        } else {
          console.log(
            `E-store ${estoreId} already exists in category: ${category}`
          );
        }
      }
    } catch (error) {
      console.error("Error adding e-store to categories:", error);
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      categories: checked
        ? [...prevData.categories, value] // Add category ID if checked
        : prevData.categories.filter((categoryId) => categoryId !== value), // Remove if unchecked
    }));
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Add New Estore</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            {formFields.map(({ label, name, type }) => (
              <div style={styles.formGroup} key={name}>
                <label style={styles.label}>{label}:</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            ))}
            <h3> Category: </h3>
            <div
              style={{
                ...styles.label,
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {estoreCategories.map((category) => (
                <label key={category.id} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={category.name} // Use category ID as the value
                    checked={formData.categories?.includes(category.name)}
                    onChange={handleCategoryChange}
                    style={styles.checkbox}
                  />
                  {category.name}
                </label>
              ))}
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : " Add Estore"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Estore Name", name: "estoreName", type: "text" },
  { label: "Estore Image", name: "imageFile", type: "file" },
  { label: "Owner Name", name: "ownerName", type: "text" },
  { label: "Owner Email", name: "ownerEmail", type: "email" },
  { label: "Owner Password", name: "ownerPassword", type: "password" },
  { label: "Estore Contact", name: "estoreContact", type: "text" },
  { label: "Estore Address", name: "estoreAddress", type: "text" },
  { label: "Estore City", name: "estoreCity", type: "text" },
];
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

export default AdminAddEstore;
