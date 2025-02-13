import { useState } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust your import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { category } from "@/data/category";

const AdminAddEstore = () => {
  const [formData, setFormData] = useState({
    estoreName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    estoreContact: "",
    estoreAddress: "",
    estoreLocation: "",
    estoreCity: "",
    estoreDistrict: "",
    estoreState: "",
    role: "estore",
    categories: [],
  });
  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const estoreCategories = category;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Set the image file state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const {
      estoreName,
      ownerName,
      ownerEmail,
      ownerPassword,
      estoreContact,
      estoreAddress,
      estoreLocation,
      estoreDistrict,
      estoreState,
      estoreCity,
      role,
      categories,
    } = formData;

    try {
      const ownerCredential = await createUserWithEmailAndPassword(
        auth,
        ownerEmail.toLowerCase(),
        ownerPassword
      );

      let firebaseImageUrl;
      if (imageFile) {
        // Upload image to Firebase Storage
        const storage = getStorage();
        const uniqueFilename = `estores/${Date.now()}_${imageFile.name}`;
        const imageRef = ref(storage, uniqueFilename);

        // Upload image to Firebase Storage
        await uploadBytes(imageRef, imageFile);
        firebaseImageUrl = await getDownloadURL(imageRef);
        setFormData((prevData) => ({
          ...prevData,
          imageUrl: firebaseImageUrl,
        }));
      }

      const estoreRef = await addDoc(collection(db, "estores"), {
        estoreName,
        imageUrl: firebaseImageUrl,
        ownerName,
        ownerEmail: ownerEmail.toLowerCase(),
        ownerId: ownerCredential.user.uid,
        estoreContact,
        estoreAddress,
        estoreLocation,
        estoreDistrict,
        estoreState,
        estoreCity,
        role,
        categories,
        createdAt: new Date(),
      });
      await addDoc(collection(db, "users"), {
        city: estoreCity,
        email: ownerEmail.toLowerCase(),
        id: ownerCredential.user.uid,
        district: estoreDistrict,
        state: estoreState,
        name: ownerName,
        phone: estoreContact,
        role: role,
        createdAt: new Date(),
      });
      const { ownerPassword: _, ...formDataWithoutPassword } = formData;

      await addEstoreToCategories(
        estoreRef.id,
        {
          ...formDataWithoutPassword,
          imageUrl: firebaseImageUrl, // Ensure the updated imageUrl is included
          ownerId: ownerCredential.user.uid,
        },
        formData.categories
      );
      setLoading(false);
      setSuccess("Estore successfully created and owner registered.");
      alert("Estore successfully created and owner registered.");
      // Reset form
      setFormData({
        estoreName: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        estoreContact: "",
        estoreAddress: "",
        estoreLocation: "",
        estoreDistrict: "",
        estoreCity: "",
        estoreState: "",
        role: "estore",
        categories: [],
      });
      setImageFile(null); // Reset the image file
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const addEstoreToCategories = async (estoreId, estoreData, categories) => {
    try {
      for (const category of categories) {
        const categoryRef = doc(db, "estoreCategories", category);
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          await setDoc(categoryRef, { createdAt: new Date() });
        }

        const estoreRef = doc(categoryRef, "stores", estoreId);
        const estoreDoc = await getDoc(estoreRef);
        if (!estoreDoc.exists()) {
          await setDoc(estoreRef, estoreData);
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
        ? [...prevData.categories, value]
        : prevData.categories.filter((categoryId) => categoryId !== value),
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

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Create a pasword for the owner:
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="ownerPassword"
                  value={formData["ownerPassword"]}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingRight: "30px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: "5px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Estore Image:</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleImageChange}
                accept="image/*" // Optional: restrict to image files
                required
              />
            </div>

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
                    value={category.name}
                    checked={formData.categories.includes(category.name)}
                    onChange={handleCategoryChange}
                    style={styles.checkbox}
                  />
                  {category.name}
                </label>
              ))}
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : "Add Estore"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Estore Name", name: "estoreName", type: "text" },
  { label: "Owner Name", name: "ownerName", type: "text" },
  { label: "Owner Email", name: "ownerEmail", type: "email" },
  // { label: "Owner Password", name: "ownerPassword", type: "password" },
  { label: "Estore Contact", name: "estoreContact", type: "text" },
  { label: "Estore Address", name: "estoreAddress", type: "text" },
  { label: "Estore Village/Town", name: "estoreLocation", type: "text" },
  { label: "Estore District", name: "estoreDistrict", type: "text" },
  { label: "Estore State", name: "estoreState", type: "text" },
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

export default AdminAddEstore;
