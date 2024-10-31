import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../../firebase/firebase"; // Import Firestore and Storage from Firebase config
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../../contexts/UserContext"; // Assumes UserContext is set up
import Worker from "@/components/auth/Worker";
import WorkerLayout from "@/components/layout/WorkerLayout";
import Header from "@/components/Header";
import { workerCategory } from "@/data/worker";

export default function AddProduct() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser(); // Assume user is available in UserContext
  const [isWorker, setIsWorker] = useState(false); // Track if user is an e-store owner
  const [loading, setLoading] = useState(true); // Loading state for verification and submission
  const [submitting, setSubmitting] = useState(false);
  const [postData, setPostData] = useState({
    content: "",
    images: [],
    categories: [],
  });
  const [images, setImages] = useState([]);
  const workerCategories = workerCategory;
  const storage = getStorage();
  // Check if the user is an e-store owner
  useEffect(() => {
    const verifyWorker = async () => {
      if (userLoading) return;
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      setLoading(true);
      try {
        const workerQuery = query(
          collection(db, "workers"),
          where("workerEmail", "==", user.email)
        );
        const querySnapshot = await getDocs(workerQuery);

        if (!querySnapshot.empty) {
          setIsWorker(true); // User is an e-store owner
        } else {
          alert("You are not authorized to post.");
          router.push("/"); // Redirect unauthorized users
        }
      } catch (error) {
        console.error("Error verifying skilled worker:", error);
        alert("Failed to verify skilled worker status.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    verifyWorker();
  }, [user, router]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    console.log("files", images);
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setPostData((prevData) => ({
      ...prevData,
      categories: checked
        ? [...prevData.categories, value] // Add category ID if checked
        : prevData.categories.filter((categoryId) => categoryId !== value), // Remove if unchecked
    }));
  };

  // Submit product to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !isWorker) return;

    setSubmitting(true);
    try {
      // Upload images to Firebase Storage and get URLs
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          if (!image) throw new Error("Invalid image file"); // Validate image
          const imageRef = ref(
            storage,
            `workersPosts/${Date.now()}_${image.name}`
          ); // Unique name
          await uploadBytes(imageRef, image);
          return await getDownloadURL(imageRef);
        })
      );
      console.log("Imgu", imageUrls);

      console.log("cat", postData.tags);

      // Add product data to Firestore
      await addDoc(collection(db, "workersPosts"), {
        ...postData,
        images: imageUrls,
        workerId: user.uid,
        createdAt: new Date(),
        workerEmail: user.email,
        workerName: user.name,
      });

      alert("Posted successfully!");
      setPostData({
        content: "",

        categories: [],
        images: [],
      });
    } catch (error) {
      console.error("Error posting:", error);
      alert("Failed to post.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading message or form based on verification
  if (loading)
    return (
      <Worker>
        <WorkerLayout>
          <Header />
          <p>Loading...</p>
        </WorkerLayout>
      </Worker>
    );
  if (!isWorker) return null; // Hide form if not authorized

  return (
    <Worker>
      <WorkerLayout>
        <Header />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <h1>Add a New Post</h1>
          <form onSubmit={handleSubmit} style={formStyles.form}>
            <label style={formStyles.label}>
              Write something...
              <textarea
                name="content"
                value={postData.content}
                onChange={handleInputChange}
                required
                style={formStyles.textarea}
              />
            </label>
            <label style={formStyles.label}>
              Images:
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/*"
                style={formStyles.fileInput}
                required
              />
            </label>
            <h3> Category: </h3>
            <div
              style={{
                ...formStyles.label,
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {workerCategories.map((category) => (
                <label key={category.id} style={formStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={category.name} // Use category ID as the value
                    checked={postData.categories?.includes(category.name)}
                    onChange={handleCategoryChange}
                    style={formStyles.checkbox}
                  />
                  {category.name}
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading} style={formStyles.button}>
              {submitting ? "Posting your works..." : "Post"}
            </button>
          </form>
        </div>
      </WorkerLayout>
    </Worker>
  );
}

const formStyles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    marginBottom: "5px",
    color: "#333",
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
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  fileInput: {
    padding: "8px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#0070f3",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
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
