import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase"; // Adjust your import path
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  where,
  doc,
  setDoc,
  getDocs,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Worker from "@/components/auth/Worker";
import WorkerLayout from "@/components/layout/WorkerLayout";
import { workerCategory } from "../../data/worker";
import { useUser } from "../../contexts/UserContext"; // Import your UserContext

const ProfileEditWorker = () => {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [formData, setFormData] = useState({
    workerName: "",
    workerEmail: "",
    workerPassword: "",
    workerContact: "",
    workerAddress: "",
    workerLocation: "",
    workerDistrict: "",
    workerState: "",
    workerCity: "",
    categories: [],
    workerDescription: "",
    role: "worker",
  });
  const [profileId, setProfileId] = useState();
  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const workerCategories = workerCategory;

  useEffect(() => {
    if (userLoading) return;
    const fetchProfile = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const profileQuery = query(
          collection(db, "workers"),
          where("workerId", "==", user.uid) // Fetch products created by the logged-in user
        );

        const querySnapshot = await getDocs(profileQuery);
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].workerId; // Get the ID of the first document

          const profileData = querySnapshot.docs[0].data();

          setFormData(profileData);

          setProfileId(docId);
          return docId; // Use this ID as needed
        } else {
          router.push("/");
        }

        // setProducts(productList); // Update state with fetched products
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const {
      workerName,
      workerContact,
      workerAddress,
      workerLocation,
      workerDistrict,
      workerState,
      workerCity,
      role,
      workerDescription,
      categories,
    } = formData;

    let firebaseImageUrl;
    if (imageFile) {
      // Upload image to Firebase Storage
      const storage = getStorage();
      const uniqueFilename = `workers/${Date.now()}_${imageFile.name}`;
      const imageRef = ref(storage, uniqueFilename);

      // Upload image to Firebase Storage
      await uploadBytes(imageRef, imageFile);
      firebaseImageUrl = await getDownloadURL(imageRef);
      setFormData((prevData) => ({
        ...prevData,
        imageUrl: firebaseImageUrl,
      }));
    } else {
      firebaseImageUrl = formData.imageUrl;
      //   setFormData((prevData) => ({
      //     ...prevData,
      //     imageUrl: formData.imageUrl,
      //   }));
    }

    let workerId;
    try {
      // Query the document where workerId matches
      const profileQuery = query(
        collection(db, "workers"),
        where("workerId", "==", user.uid)
      );

      const querySnapshot = await getDocs(profileQuery);

      if (!querySnapshot.empty) {
        // Get the document ID
        const docId = querySnapshot.docs[0].id;
        workerId = docId;
        // Update the document
        await updateDoc(doc(db, "workers", docId), {
          workerName,
          imageUrl: firebaseImageUrl,
          workerContact,
          workerAddress,
          workerLocation,
          workerCity,
          workerDistrict,
          workerState,
          categories,
          workerDescription,
          role,
          editedAt: new Date(),
        });
      } else {
        console.log("No document found for this workerId.");
      }
    } catch (error) {
      console.error("Error updating e-store:", error);
    }

    try {
      // Query the worker document where workerId matches user.uid
      const workerQuery = query(
        collection(db, "workers"),
        where("workerId", "==", user.uid)
      );
      const workerSnapshot = await getDocs(workerQuery);

      if (workerSnapshot.empty) {
        console.log("No document found for this workerId.");
        return;
      }

      // Get the worker's document ID
      const workerDocId = workerSnapshot.docs[0].data().workerId;

      // Query the user document where id matches workerDocId
      const userQuery = query(
        collection(db, "users"),
        where("id", "==", workerDocId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        console.log("No matching user document found for the given workerId.");
        return;
      }
      // Update the user document with the provided data
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        city: workerCity,
        name: workerName,
        phone: workerContact,
        role,
        editedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user details:", error);
    }

    const { workerPassword: _, ...formDataWithoutPassword } = formData;

    await updateWorkerCategories(
      workerId,
      {
        ...formDataWithoutPassword,
        imageUrl: firebaseImageUrl, // Ensure the updated imageUrl is included
      },
      formData.categories
    );
    setLoading(false);
    setSuccess("Worker successfully updated.");
    alert("Worker successfully updated.");
    // Reset form
    setFormData({
      workerName: "",
      workerEmail: "",
      workerPassword: "",
      workerContact: "",
      workerAddress: "",
      workerLocation: "",
      workerDistrict: "",
      workerState: "",
      workerCity: "",
      workerDescription: "",
      categories: [],
      role: "worker",
    });
    setImageFile(null); // Reset the image file
  };

  const updateWorkerCategories = async (
    workerId,
    workerData,
    newCategories
  ) => {
    const batch = writeBatch(db); // Initialize batch

    try {
      // Remove e-store from old categories
      const categoriesSnapshot = await getDocs(
        collection(db, "workerCategories")
      );

      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryRef = categoryDoc.ref;
        const storesSnapshot = await getDocs(
          collection(categoryRef, "workers")
        );

        for (const storeDoc of storesSnapshot.docs) {
          if (storeDoc.id === workerId) {
            batch.delete(storeDoc.ref); // Add delete operation to batch
          }
        }
      }

      // Add e-store to new categories
      try {
        for (const category of newCategories) {
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
        console.error("Error updating to categories:", error);
      }

      // Commit the batch after all operations
      await batch.commit();
    } catch (error) {
      console.error("Error updating categories:", error);
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
    <Worker>
      <WorkerLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Edit Worker</h1>
          <form onSubmit={handleEditSubmit} style={styles.form}>
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
              <label style={styles.label}>A short note about you:</label>
              <textarea
                type="text"
                name="workerDescription"
                value={formData.workerDescription}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Worker Image:</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleImageChange}
                accept="image/*" // Optional: restrict to image files
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
              {workerCategories.map((category) => (
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
              {loading ? "Submitting..." : "Update Profile"}
            </button>
          </form>
        </div>
      </WorkerLayout>
    </Worker>
  );
};

const formFields = [
  { label: "Worker Name", name: "workerName", type: "text" },
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

export default ProfileEditWorker;
