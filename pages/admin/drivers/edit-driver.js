import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase/firebase"; // Adjust path if needed
import { useRouter } from "next/router";

import {
  collection,
  addDoc,
  getDoc,
  where,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "@/components/Header";
import Admin from "@/components/auth/Admin";
import AdminLayout from "@/components/layout/AdminLayout";

import { useUser } from "../../../contexts/UserContext"; // Import your UserContext

const ProfileEditWorker = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: userLoading } = useUser(); // Access the user context
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
  const [driverId, setWorkerId] = useState();
  const [imageFile, setImageFile] = useState(null); // Separate state for the image file
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    const fetchProfile = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const driverRef = doc(db, "drivers", id);
        const driverDoc = await getDoc(driverRef);
        if (driverDoc.exists()) {
          setFormData(driverDoc.data());
          setWorkerId(driverDoc.data().driverId);
        } else {
          alert("Product not found!");
          router.push("/drivers-list"); // Redirect if product not found
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
      driverName,
      driverContact,
      driverAddress,
      driverLocation,
      driverDistrict,
      driverState,
      driverCity,
      role,
    } = formData;

    let firebaseImageUrl;
    if (imageFile) {
      // Upload image to Firebase Storage
      const storage = getStorage();
      const uniqueFilename = `drivers/${Date.now()}_${imageFile.name}`;
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
    }
    try {
      const profileQuery = query(
        collection(db, "drivers"),
        where("driverId", "==", driverId)
      );
      const querySnapshot = await getDocs(profileQuery);
      if (!querySnapshot.empty) {
        // Get the document ID
        const docId = querySnapshot.docs[0].id;
        // Update the document
        await updateDoc(doc(db, "drivers", docId), {
          driverName,
          imageUrl: firebaseImageUrl,
          driverContact,
          driverAddress,
          driverLocation,
          driverCity,
          driverDistrict,
          driverState,
          role,
          editedAt: new Date(),
        });
      } else {
        console.log("No document found for this driverId.");
      }
    } catch (error) {
      console.error("Error updating e-store:", error);
    }

    try {
      const driverQuery = query(
        collection(db, "drivers"),
        where("driverId", "==", driverId)
      );
      const driverSnapshot = await getDocs(driverQuery);
      if (driverSnapshot.empty) {
        console.log("No document found for this driverId.");
        return;
      }

      // Get the driver's document ID
      const driverDocId = driverSnapshot.docs[0].data().driverId;

      // Query the user document where id matches driverDocId
      const userQuery = query(
        collection(db, "users"),
        where("id", "==", driverDocId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        console.log("No matching user document found for the given driverId.");
        return;
      }
      // Update the user document with the provided data
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        city: driverCity,
        name: driverName,
        phone: driverContact,
        district: driverDistrict,
        state: driverState,
        role,
        editedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user details:", error);
    }

    setLoading(false);
    setSuccess("Driver successfully updated.");
    alert("Driver successfully updated.");
    // Reset form
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
      driverDescription: "",
      categories: [],
      role: "driver",
    });
    setImageFile(null); // Reset the image file
  };

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.title}>Edit Driver</h1>
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
              <label style={styles.label}>Driver Image:</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleImageChange}
                accept="image/*" // Optional: restrict to image files
              />
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
  { label: "Driver Name", name: "driverName", type: "text" },
  { label: "Driver Contact", name: "driverContact", type: "text" },
  { label: "Driver Address", name: "driverAddress", type: "text" },
  { label: "Driver Village/Town", name: "driverLocation", type: "text" },
  { label: "Driver District", name: "driverDistrict", type: "text" },
  { label: "Driver State", name: "driverState", type: "text" },
  { label: "Driver City", name: "driverCity", type: "text" },
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
