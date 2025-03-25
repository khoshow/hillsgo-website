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
import { category } from "../../../data/category";
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext

const ProfileEditEstore = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: userLoading } = useUser(); // Access the user context
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
    estoreDescription: "",
    estoreRate: "",
    role: "estore",
    categories: [],
  });
  const [estoreId, setEstoreId] = useState();
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
        const estoreRef = doc(db, "estores", id);
        const estoreDoc = await getDoc(estoreRef);

        if (estoreDoc.exists()) {
          setFormData(estoreDoc.data());
          setEstoreId(estoreDoc.data().estoreId);
        } else {
          alert("Product not found!");
          router.push("/estores-list"); // Redirect if product not found
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
      estoreName,
      ownerName,
      ownerEmail,
      ownerPassword,
      estoreContact,
      estoreAddress,
      estoreLocation,
      estoreCity,
      estoreDistrict,
      estoreState,
      estoreDescription,
      estoreRate,
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

    try {
      // Query the document where estoreId matches
      const profileQuery = query(
        collection(db, "estores"),
        where("estoreId", "==", estoreId)
      );

      const querySnapshot = await getDocs(profileQuery);

      if (!querySnapshot.empty) {
        // Get the document ID
        const docId = querySnapshot.docs[0].id;

        // Update the document
        await updateDoc(doc(db, "estores", docId), {
          estoreName,
          imageUrl: firebaseImageUrl,
          estoreContact,
          estoreRate,
          estoreAddress,
          estoreLocation,
          estoreCity,
          estoreDistrict,
          estoreState,
          categories,
          estoreDescription,
          role,
          editedAt: new Date(),
        });
      } else {
        console.log("No document found for this estoreId.");
      }
    } catch (error) {
      console.error("Error updating e-store:", error);
    }

    try {
      // Query the estore document where estoreId matches user.uid
      const estoreQuery = query(
        collection(db, "estores"),
        where("estoreId", "==", estoreId)
      );
      const estoreSnapshot = await getDocs(estoreQuery);

      if (estoreSnapshot.empty) {
        console.log("No document found for this estoreId.");
        return;
      }

      // Get the estore's document ID
      const estoreDocId = estoreSnapshot.docs[0].data().estoreId;

      // Query the user document where id matches estoreDocId
      const userQuery = query(
        collection(db, "users"),
        where("id", "==", estoreDocId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        console.log("No matching user document found for the given estoreId.");
        return;
      }
      // Update the user document with the provided data
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        city: estoreCity,
        name: estoreName,
        phone: estoreContact,
        district: estoreDistrict,
        state: estoreState,
        role,
        editedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user details:", error);
    }

    const { estorePassword: _, ...formDataWithoutPassword } = formData;

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
    alert("Estore successfully updated.");
    // Reset form
    setFormData({
      estoreName: "",
      estoreEmail: "",
      estorePassword: "",
      estoreContact: "",
      estoreAddress: "",
      estoreLocation: "",
      estoreDistrict: "",
      estoreState: "",
      estoreCity: "",
      estoreDescription: "",
      categories: [],
      role: "estore",
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
        const storesSnapshot = await getDocs(
          collection(categoryRef, "estores")
        );

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

          const estoreRef = doc(categoryRef, "estores", estoreId);
          const estoreDoc = await getDoc(estoreRef);
          if (!estoreDoc.exists()) {
            await setDoc(estoreRef, estoreData);
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
              <label style={styles.label}>A short note about you:</label>
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
      </AdminLayout>
    </Admin>
  );
};

const formFields = [
  { label: "Estore Name", name: "estoreName", type: "text" },
  { label: "Estore Rate", name: "estoreRate", type: "text" },
  { label: "Estore Contact", name: "estoreContact", type: "text" },
  { label: "Estore Address", name: "estoreAddress", type: "text" },
  { label: "Estore Village/Town", name: "estoreLocation", type: "text" },
  { label: "Estore District", name: "estoreDistrict", type: "text" },
  { label: "Estore State", name: "estoreState", type: "text" },
  { label: "Estore City", name: "estoreCity", type: "text" },
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

export default ProfileEditEstore;
