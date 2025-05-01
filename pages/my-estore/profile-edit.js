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
import Estore from "@/components/auth/Estore";
import EstoreLayout from "@/components/layout/EstoreLayout";
import { category } from "@/data/category";
import { useUser } from "../../contexts/UserContext"; // Import your UserContext

const ProfileEditEstore = () => {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [formData, setFormData] = useState({
    estoreName: "",
    ownerName: "",
    estoreContact: "",
    estoreAddress: "",
    estoreLocation: "",
    estoreCity: "",
    estoreDistrict: "",
    estoreState: "",
    estoreDescription: "",
    role: "estore",
    categories: [],
  });
  const [profileId, setProfileId] = useState();
  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const estoreCategories = category;

  useEffect(() => {
    if (userLoading) return;
    const fetchProfile = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const profileQuery = query(
          collection(db, "estores"),
          where("ownerId", "==", user.uid) // Fetch products created by the logged-in user
        );

        const querySnapshot = await getDocs(profileQuery);
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].ownerId; // Get the ID of the first document

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
      estoreName,
      ownerName,

      estoreContact,
      estoreAddress,
      estoreLocation,
      estoreDistrict,
      estoreState,
      estoreCity,
      estoreDescription,
      role,
      categories,
    } = formData;

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
    } else {
      firebaseImageUrl = formData.imageUrl;
      //   setFormData((prevData) => ({
      //     ...prevData,
      //     imageUrl: formData.imageUrl,
      //   }));
    }

    let estoreId;
    try {
      // Query the document where ownerId matches
      const profileQuery = query(
        collection(db, "estores"),
        where("ownerId", "==", user.uid)
      );

      const querySnapshot = await getDocs(profileQuery);

      if (!querySnapshot.empty) {
        // Get the document ID
        const docId = querySnapshot.docs[0].id;
        estoreId = docId;
        // Update the document
        await updateDoc(doc(db, "estores", docId), {
          estoreName,
          imageUrl: firebaseImageUrl,
          ownerName,

          estoreContact,
          estoreAddress,
          estoreLocation,
          estoreDistrict,
          estoreState,
          estoreCity,
          estoreDescription,
          role,
          categories,
          editedAt: new Date(),
        });
      } else {
        console.log("No document found for this ownerId.");
      }
    } catch (error) {
      console.error("Error updating e-store:", error);
    }

    try {
      // Query the worker document where workerId matches user.uid
      const estoreQuery = query(
        collection(db, "estores"),
        where("ownerId", "==", user.uid)
      );
      const estoreSnapshot = await getDocs(estoreQuery);

      if (estoreSnapshot.empty) {
        console.log("No document found for this estoreId.");
        return;
      }

      // Get the worker's document ID
      const ownerDocId = estoreSnapshot.docs[0].data().ownerId;

      // Query the user document where id matches workerDocId
      const userQuery = query(
        collection(db, "users"),
        where("id", "==", ownerDocId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        console.log("No matching user document found for the given workerId.");
        return;
      }

      // Update the user document with the provided data
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        city: estoreCity,
        name: ownerName,
        phone: estoreContact,
        role: role,
        editeddAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user details:", error);
    }
    const { ownerPassword: _, ...formDataWithoutPassword } = formData;
    await updateEstoreCategories(
      estoreId,
      {
        ...formDataWithoutPassword,
        imageUrl: firebaseImageUrl, // Ensure the updated imageUrl is included
      },
      formData.categories
    );
    setLoading(false);
    setSuccess("Estore successfully updated.");
    alert("Estore successfully updated..");
    // Reset form
    setFormData({
      estoreName: "",
      ownerName: "",
      estoreContact: "",
      estoreAddress: "",
      estoreLocation: "",
      estoreDistrict: "",
      estoreCity: "",
      estoreState: "",
      estoreDescription: "",
      role: "estore",
      categories: [],
    });
    setImageFile(null); // Reset the image file
  };

  const updateEstoreCategories = async (
    estoreId,
    estoreData,
    newCategories
  ) => {
    const batch = writeBatch(db); // Initialize batch

    try {
      // Remove e-store from old categories
      const categoriesSnapshot = await getDocs(
        collection(db, "estoreCategories")
      );
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryRef = categoryDoc.ref;
        const storesSnapshot = await getDocs(collection(categoryRef, "stores"));
        for (const storeDoc of storesSnapshot.docs) {
          if (storeDoc.id === estoreId) {
            batch.delete(storeDoc.ref); // Add delete operation to batch
          }
        }
      }

      // Add e-store to new categories
      try {
        for (const category of newCategories) {
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

      // Commit the batch after all operations
      await batch.commit();
    } catch (error) {
      console.error("Error updating e-store categories:", error);
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
    <Estore>
      <EstoreLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Edit Estore</h1>
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
              <label style={styles.label}>A short note about your store:</label>
              <textarea
                type="text"
                name="estoreDescription"
                value={formData.estoreDescription}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Estore Image:</label>
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
              {loading ? "Submitting..." : "Update Profile"}
            </button>
          </form>
        </div>
      </EstoreLayout>
    </Estore>
  );
};

const formFields = [
  { label: "Estore Name", name: "estoreName", type: "text" },
  { label: "Owner Name", name: "ownerName", type: "text" },
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

export default ProfileEditEstore;
