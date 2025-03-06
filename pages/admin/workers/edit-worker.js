import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust path if needed
import { useRouter } from "next/router";

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
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";
import { workerCategory } from "../../../data/worker";
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext

const ProfileEditWorker = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: userLoading } = useUser(); // Access the user context
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
    workerDescription: "",
    role: "worker",
  });
  const [workerId, setWorkerId] = useState();
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
        const workerRef = doc(db, "workers", id);
        const workerDoc = await getDoc(workerRef);

        if (workerDoc.exists()) {
          setFormData(workerDoc.data());
          setWorkerId(workerDoc.data().workerId);
        } else {
          alert("Product not found!");
          router.push("/workers-list"); // Redirect if product not found
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, id]);

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
      workerRate,
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

    try {
      // Query the document where workerId matches
      const profileQuery = query(
        collection(db, "workers"),
        where("workerId", "==", workerId)
      );

      const querySnapshot = await getDocs(profileQuery);

      if (!querySnapshot.empty) {
        // Get the document ID
        const docId = querySnapshot.docs[0].id;

        // Update the document
        await updateDoc(doc(db, "workers", docId), {
          workerName,
          imageUrl: firebaseImageUrl,
          workerContact,
          workerRate,
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
        where("workerId", "==", workerId)
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
        district: workerDistrict,
        state: workerState,
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
    <Admin>
      <AdminLayout>
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
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Worker Name", name: "workerName", type: "text" },
  { label: "Worker Rate", name: "workerRate", type: "text" },
  { label: "Worker Contact", name: "workerContact", type: "text" },
  { label: "Worker Address", name: "workerAddress", type: "text" },
  { label: "Worker Village/Town", name: "workerLocation", type: "text" },
  { label: "Worker District", name: "workerDistrict", type: "text" },
  { label: "Worker State", name: "workerState", type: "text" },
  { label: "Worker City", name: "workerCity", type: "text" },
];

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  heading: {
    fontSize: "2.5em",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "1.1em",
    marginBottom: "5px",
  },
  discountLabel: {
    backgroundColor: "#95d500",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    height: "100px",
  },
  fileInput: {
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  currentImages: {
    marginTop: "20px",
  },
  image: {
    width: "100px",
    height: "auto",
    marginRight: "10px",
    borderRadius: "5px",
  },
};

export default ProfileEditWorker;
