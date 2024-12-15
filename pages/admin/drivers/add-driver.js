import { useState } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust your import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";

const AdminAddDriver = () => {
  const [formData, setFormData] = useState({
    driverName: "",
    driverEmail: "",
    driverPassword: "",
    driverContact: "",
    driverAddress: "",
    driverLocation: "",
    driverDistrict: "",
    driverState: "",
    driverCity: "",
    role: "driver",
  });
  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

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
    console.log("passwor", formData.driverPassword);
    const {
      driverName,
      driverEmail,
      driverPassword,
      driverContact,
      driverAddress,
      driverLocation,
      driverDistrict,
      driverState,
      driverCity,
      role,
    } = formData;

    try {
      const driverCredential = await createUserWithEmailAndPassword(
        auth,
        driverEmail,
        driverPassword
      );

      let firebaseImageUrl = "";
      if (imageFile) {
        // Upload image to Firebase Storage
        const storage = getStorage();
        const uniqueFilename = `drivers/${Date.now()}_${imageFile.name}`;
        const imageRef = ref(storage, uniqueFilename);

        await uploadBytes(imageRef, imageFile);
        firebaseImageUrl = await getDownloadURL(imageRef);
        setFormData((prevData) => ({
          ...prevData,
          imageUrl: firebaseImageUrl,
        }));
      }

      await addDoc(collection(db, "drivers"), {
        driverName,
        imageUrl: firebaseImageUrl,
        driverEmail,
        driverId: driverCredential.user.uid,
        driverContact,
        driverAddress,
        driverLocation,
        driverCity,
        driverDistrict,
        driverState,

        role,
        createdAt: new Date(),
      });

      setLoading(false);
      setSuccess("Driver successfully created and registered.");
      setFormData({
        driverName: "",
        driverEmail: "",
        driverPassword: "",
        driverContact: "",
        driverAddress: "",
        driverLocation: "",
        driverDistrict: "",
        driverState: "",
        driverCity: "",
        categories: [],
        role: "driver",
      });
      setImageFile(null); // Reset the image file state after submission
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Add New Driver</h1>
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
            <div style={{}}>
              <label style={styles.label}>Password:</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} // Toggle input type
                  name="driverPassword"
                  value={formData.driverPassword}
                  onChange={handleChange}
                  required
                  style={{
                    ...styles.input,
                    paddingRight: "40px",
                    width: "90%", // Ensure space for the eye icon
                  }}
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Driver Image:</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleImageChange}
                accept="image/*" // Optional: restrict to image files
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting..." : "Add Driver"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Driver Name", name: "driverName", type: "text" },
  { label: "Driver Email", name: "driverEmail", type: "email" },

  { label: "Driver Contact", name: "driverContact", type: "text" },
  { label: "Driver Address", name: "driverAddress", type: "text" },
  { label: "Driver Village/Town", name: "driverLocation", type: "text" },
  { label: "Driver District", name: "driverDistrict", type: "text" },
  { label: "Driver State", name: "driverState", type: "text" },
  { label: "Driver City", name: "driverCity", type: "text" },
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

export default AdminAddDriver;
