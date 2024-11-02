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
import { workerCategory } from "../../../data/worker";

const AdminAddWorker = () => {
  const [formData, setFormData] = useState({
    workerName: "",
    imageUrl: "",
    workerEmail: "",
    workerPassword: "",
    workerContact: "",
    workerAddress: "",
    workerCity: "",
    categories: [],
    role: "worker",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const workerCategories = workerCategory;

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
      workerName,
      imageFile,
      workerEmail,
      workerPassword,
      workerContact,
      workerAddress,
      workerCity,
      role,
      categories,
    } = formData;

    try {
      const workerCredential = await createUserWithEmailAndPassword(
        auth,
        workerEmail,
        workerPassword
      );

      let imageUrl = "";
      if (imageFile) {
        // Upload image to Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, `workers/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const workerRef = await addDoc(collection(db, "workers"), {
        workerName,
        imageUrl,
        workerEmail,
        workerId: workerCredential.user.uid,
        workerContact,
        workerAddress,
        workerCity,
        imageUrl,
        categories,
        role,

        createdAt: new Date(),
      });
      await addWorkerToCategories(workerRef.id, formData, formData.categories);
      setLoading(false);
      setSuccess("Worker successfully created and worker registered.");
      setFormData({
        workerName: "",
        imageUrl: "",
        workerEmail: "",
        workerPassword: "",
        workerContact: "",
        workerAddress: "",
        workerCity: "",
        role: "",
        categories: [],
        imageFile: null,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const addWorkerToCategories = async (workerId, workerData, categories) => {
    console.log("Adding worker to categories:", workerId);

    try {
      for (const category of categories) {
        // Reference to the category document in workerCategories
        const categoryRef = doc(db, "workerCategories", category);

        // Check if the category document exists; create it if it doesn’t
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          console.log(`Creating category document for: ${category}`);
          await setDoc(categoryRef, { createdAt: new Date() });
        }

        // Reference to the specific worker document within the category's stores subcollection
        const workerRef = doc(categoryRef, "worker", workerId);

        // Check if the worker already exists in the category's stores subcollection
        const workerDoc = await getDoc(workerRef);
        if (!workerDoc.exists()) {
          // Add the worker document if it doesn’t exist in this category
          await setDoc(workerRef, workerData);
          console.log(`Added worker ${workerId} to category: ${category}`);
        } else {
          console.log(
            `Worker ${workerId} already exists in category: ${category}`
          );
        }
      }
    } catch (error) {
      console.error("Error adding worker to categories:", error);
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
          <h1 style={styles.title}>Add New Worker</h1>
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
              {workerCategories.map((category) => (
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
              {loading ? "Submitting..." : " Add worker"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Worker Name", name: "workerName", type: "text" },
  { label: "Worker Image", name: "imageFile", type: "file" },

  { label: "Worker Email", name: "workerEmail", type: "email" },
  { label: "Worker Password", name: "workerPassword", type: "password" },
  { label: "Worker Contact", name: "workerContact", type: "text" },
  { label: "Worker Address", name: "workerAddress", type: "text" },
  { label: "Worker City", name: "workerCity", type: "text" },
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
};

// Form fields configuration

export default AdminAddWorker;
