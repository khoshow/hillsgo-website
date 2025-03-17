import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase"; // Adjust path if needed
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlogs(blogData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <p style={styles.loading}>Loading blogs...</p>;
  if (!blogs) return <p style={styles.error}>Blogs not found.</p>;

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Latest Blogs</h1>
        <div style={styles.grid}>
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.id}`} style={styles.card}>
              <img src={blog.imageUrl} alt={blog.title} style={styles.image} />
              <div style={styles.content}>
                <h2 style={styles.blogTitle}>{blog.title}</h2>
                <p style={styles.date}>
                  {blog.createdAt?.seconds
                    ? new Date(blog.createdAt.seconds * 1000).toDateString()
                    : "Unknown Date"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};
const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    flex: 1,
  },
  title: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "20px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "280px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textDecoration: "none",
    color: "inherit",
    backgroundColor: "#fff",
    transition: "transform 0.2s ease-in-out",
  },
  cardHover: {
    transform: "scale(1.02)",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  content: {
    padding: "15px",
  },
  blogTitle: {
    fontSize: "18px",
    marginBottom: "10px",
  },
  date: {
    fontSize: "14px",
    color: "#666",
  },

  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
  error: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
};

export default BlogList;
