import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase/firebase"; // Import your Firestore config
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { colors } from "@/data/colors";
import ImageSlider from "../../components/sliders/ImageSliders";
import { useUser } from "../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import WorkerLayout from "@/components/layout/WorkerLayout"; // Assuming you have a layout for Estore
import Worker from "@/components/auth/Worker";

export default function MyPosts() {
  const { user, loading: userLoading } = useUser(); // Access the user context
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    if (userLoading) return;
    const fetchPosts = async () => {
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      try {
        const postsQuery = query(
          collection(db, "workersPosts"),
          where("workerId", "==", user.uid) // Fetch products created by the logged-in user
        );

        const querySnapshot = await getDocs(postsQuery);
        const postsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(postsList); // Update state with fetched products
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, router]);
  const handleDelete = async (postId, imageUrls) => {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      // Delete product document from Firestore
      await deleteDoc(doc(db, "workersPosts", postId));
      // Delete each image from Firebase Storage
      if (imageUrls) {
        const deletePromises = imageUrls.map(async (url) => {
          const imageName = decodeURIComponent(
            url.substring(url.lastIndexOf("/") + 1, url.indexOf("?"))
          );
          console.log("Imag", imageName);

          const imageRef = ref(storage, `${imageName}`);
          await deleteObject(imageRef);
        });
        await Promise.all(deletePromises);
      }

      // Update local state to remove deleted product
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete the post.");
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
          <h1 style={styles.heading}>My Posts</h1>
          <div style={styles.productGrid}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} style={styles.productCard}>
                  <ImageSlider images={post.images} />
                  <p>{post.content}</p>

                  {/* Display all images */}

                  {/* Display all categories */}
                  <div style={styles.categoriesContainer}>
                    <p>Categories:</p>
                    {post.categories && post.categories.length > 0 ? (
                      post.categories.map((category, index) => (
                        <span key={index} style={styles.categoryBadge}>
                          {category}
                        </span>
                      ))
                    ) : (
                      <p>No categories assigned.</p>
                    )}
                  </div>

                  <button
                    style={styles.editButton}
                    onClick={() =>
                      router.push(`/skilled-worker/edit-post?id=${post.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDelete(post.id, post.images)}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
        </div>
      </WorkerLayout>
    </Worker>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  productGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  productCard: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  imagesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
  },
  image: {
    width: "50%",
    height: "auto",
    objectFit: "cover",
    marginBottom: "5px",
  },
  categoriesContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "10px",
  },
  categoryBadge: {
    fontSize: "14px",
    backgroundColor: colors.greyLight,
    color: "#fff",
    borderRadius: "2px",
    height: "20px",
    margin: "2px",
    padding: "2px",
  },
  editButton: {
    margin: "5px",
    padding: "10px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    margin: "5px",
    padding: "10px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
