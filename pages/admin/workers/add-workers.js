import { useState } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust your import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
// import withAuth from "@/lib/isAuth";

const AdminAddWorker = () => {
  const [formData, setFormData] = useState({
    workerName: "",
    imageUrl: "",
    workerEmail: "",
    workerPassword: "",
    workerContact: "",
    workerAddress: "",
    workerCity: "",
    role: "worker",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

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

      await addDoc(collection(db, "workers"), {
        workerName,
        imageUrl,
        workerEmail,
        workerId: workerCredential.user.uid,
        workerContact,
        workerAddress,
        workerCity,
        imageUrl,
        role,
        createdAt: new Date(),
      });
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
        imageFile: null,
      });
    } catch (error) {
      setError(error.message);
    }
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
