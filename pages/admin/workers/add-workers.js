import { useState } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust your import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { workerCategory } from "../../../data/worker";

const AdminAddWorker = () => {
  const [formData, setFormData] = useState({
    workerName: "",
    workerEmail: "",
    workerRate: "",
    workerPassword: "",
    workerContact: "",
    workerAddress: "",
    workerLocation: "",
    workerDistrict: "",
    workerState: "",
    workerCity: "",
    categories: [],
    role: "worker",
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const workerCategories = workerCategory;

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
      workerName,
      workerEmail,
      workerRate,
      workerPassword,
      workerContact,
      workerAddress,
      workerLocation,
      workerDistrict,
      workerState,
      workerCity,
      role,
      categories,
    } = formData;

    try {
      const workerCredential = await createUserWithEmailAndPassword(
        auth,
        workerEmail.toLowerCase(),
        workerPassword
      );

      let firebaseImageUrl = "";
      if (imageFile) {
        // Upload image to Firebase Storage
        const storage = getStorage();
        const uniqueFilename = `workers/${Date.now()}_${imageFile.name}`;
        const imageRef = ref(storage, uniqueFilename);

        await uploadBytes(imageRef, imageFile);
        firebaseImageUrl = await getDownloadURL(imageRef);
        setFormData((prevData) => ({
          ...prevData,
          imageUrl: firebaseImageUrl,
        }));
      }

      const enhancedKeywords = [
        ...new Set([
          ...keywords, // existing user input
          workerName.toLowerCase(), // additional keyword based on name
          ...workerName.toLowerCase().split(" "),
        ]),
      ];
      const workerRef = await addDoc(collection(db, "workers"), {
        workerName,
        imageUrl: firebaseImageUrl,
        workerEmail: workerEmail.toLowerCase(),
        workerId: workerCredential.user.uid,
        workerRate,
        workerContact,
        workerAddress,
        workerLocation,
        workerCity,
        workerDistrict,
        workerState,
        categories,
        views: 0,
        reviews: 0,
        keywords: enhancedKeywords,
        role,

        createdAt: new Date(),
      });

      await addDoc(collection(db, "users"), {
        city: workerCity,
        district: workerDistrict,
        state: workerState,
        email: workerEmail.toLowerCase(),
        id: workerCredential.user.uid,
        name: workerName,
        phone: workerContact,
        role: role,
        createdAt: new Date(),
      });

      await addWorkerToCategories(
        workerRef.id,
        {
          ...formData,
          imageUrl: firebaseImageUrl, // Ensure the updated imageUrl is included
          workerId: workerCredential.user.uid,
        },
        categories
      );
      setLoading(false);
      setSuccess("Worker successfully created and registered.");
      setFormData({
        workerName: "",
        workerEmail: "",
        workerRate: "",
        workerPassword: "",
        workerContact: "",
        workerAddress: "",
        workerLocation: "",
        workerDistrict: "",
        workerState: "",
        workerCity: "",
        categories: [],
        role: "worker",
      });
      setKeywords([]);
      setImageFile(null); // Reset the image file state after submission
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const addWorkerToCategories = async (workerId, workerData, categories) => {
    try {
      for (const category of categories) {
        const categoryRef = doc(db, "workerCategories", category);
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
          await setDoc(categoryRef, { createdAt: new Date() });
        }

        const workerRef = doc(categoryRef, "workers", workerId);
        const workerDoc = await getDoc(workerRef);
        if (!workerDoc.exists()) {
          await setDoc(workerRef, workerData);
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
        ? [...prevData.categories, value]
        : prevData.categories.filter((categoryId) => categoryId !== value),
    }));
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();

    if (!trimmed) return;

    if (keywords.length >= 8) {
      alert("You can only add up to 8 keywords.");
      return;
    }

    if (!keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }

    setKeywordInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default Enter behavior
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (wordToRemove) => {
    setKeywords((prev) => prev.filter((kw) => kw !== wordToRemove));
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
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Create a pasword for the worker:
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="workerPassword"
                  value={formData["workerPassword"]}
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
              <label style={styles.label}>Worker Image:</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleImageChange}
                accept="image/*" // Optional: restrict to image files
                required
              />
            </div>

            <h3>Category:</h3>
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
                    checked={formData.categories.includes(category.name)}
                    onChange={handleCategoryChange}
                    style={styles.checkbox}
                  />
                  {category.name}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a keyword and press Enter"
                  style={{ padding: "0.5rem", flex: 1 }}
                />
                <button
                  onClick={handleAddKeyword}
                  type="button"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Add
                </button>
              </div>

              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "#eee",
                      padding: "0.4rem 0.7rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveKeyword(kw)}
                    title="Click to remove"
                  >
                    {kw} ✕
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : "Add Worker"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Worker Name", name: "workerName", type: "text" },
  { label: "Worker Email", name: "workerEmail", type: "email" },
  { label: "Worker Rate", name: "workerRate", type: "text" },
  { label: "Worker Contact", name: "workerContact", type: "text" },
  { label: "Worker Address", name: "workerAddress", type: "text" },
  { label: "Worker Village/Town", name: "workerLocation", type: "text" },
  { label: "Worker District", name: "workerDistrict", type: "text" },
  { label: "Worker State", name: "workerState", type: "text" },
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
};

// Form fields configuration

export default AdminAddWorker;
