// pages/post/edit-post.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase/firebase"; // Adjust the import according to your firebase setup
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useUser } from "../../contexts/UserContext";
import Header from "@/components/Header";
import WorkerLayout from "@/components/layout/WorkerLayout";
import Worker from "@/components/auth/Worker";
import { workerCategory } from "@/data/worker";

const EditPost = () => {
  const router = useRouter();
  const { id } = router.query; // Get the post ID from the query
  const { user } = useUser();
  const [postData, setPostData] = useState({
    content: "",
    images: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const storage = getStorage();
  const workerCategories = workerCategory;

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      const postDoc = await getDoc(doc(db, "workersPosts", id));
      if (postDoc.exists()) {
        setPostData(postDoc.data());
      } else {
        console.error("No such document!");
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setPostData((prev) => {
      const categories = checked
        ? [...prev.categories, value]
        : prev.categories.filter((category) => category !== value);
      return { ...prev, categories };
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = await Promise.all(
      files.map(async (file) => {
        const imageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef); // Correctly getting the download URL
      })
    );

    setPostData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageUrls],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const postRef = doc(db, "workersPosts", id);
      await updateDoc(postRef, postData);
      alert("Post updated successfully!");
      setPostData({
        content: "",

        categories: [],
        images: [],
      });
      //   router.push("/post/my-posts"); // Redirect to My Posts after editing
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  if (loading)
    return (
      <Worker>
        <WorkerLayout>
          <Header />
          <p>Loading...</p>
        </WorkerLayout>
      </Worker>
    );

  return (
    <Worker>
      <WorkerLayout>
        <Header />
        <div style={styles.container}>
          <h1>Edit Post</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label>
                Content:
                <textarea
                  name="content"
                  value={postData.content}
                  onChange={handleChange}
                  required
                  style={styles.textarea}
                />
              </label>
            </div>
            <div>
              <label>
                Categories:
                {workerCategories.map((category) => (
                  <label key={category.id} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value={category.name}
                      checked={postData.categories.includes(category.name)}
                      onChange={handleCategoryChange}
                      style={styles.checkbox}
                    />
                    {category.name}
                  </label>
                ))}
              </label>
            </div>
            <div>
              <label>
                Upload Images:
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div style={styles.imagePreview}>
              {postData.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post Image ${index + 1}`}
                  style={styles.image}
                />
              ))}
            </div>
            <button type="submit" style={styles.submitButton}>
              Update Post
            </button>
          </form>
        </div>
      </WorkerLayout>
    </Worker>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  textarea: {
    width: "100%",
    height: "100px",
  },
  checkboxLabel: {
    marginRight: "10px",
  },
  checkbox: {
    marginRight: "5px",
  },
  imagePreview: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  image: {
    width: "100px",
    height: "auto",
    objectFit: "cover",
  },
  submitButton: {
    padding: "10px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default EditPost;
