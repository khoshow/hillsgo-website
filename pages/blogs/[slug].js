import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  query,
  getDocs,
  collection,
  where,
} from "firebase/firestore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BlogDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchBlogBySlug = async (slug) => {
      setLoading(true);

      try {
        const q = query(collection(db, "blogs"), where("slug", "==", slug));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Since slug is unique, take the first match
          const blogData = querySnapshot.docs[0].data();

          return setBlog(blogData);
        } else {
          console.log("No blog found with this slug");
          return null;
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogBySlug(slug);
  }, [slug]);

  if (loading) return <p style={styles2.loading}>Loading...</p>;
  if (!blog) return <p style={styles2.error}>Blog not found.</p>;

  return (
    <>
      <Header />
      <div style={styles2.container}>
        <h1 style={styles2.title}>{blog.title}</h1>
        <p style={styles2.date}>
          {new Date(blog.createdAt.seconds * 1000).toDateString()}
        </p>
        <img src={blog.imageUrl} alt={blog.title} style={styles2.image} />
        <div
          style={styles2.content}
          dangerouslySetInnerHTML={{ __html: blog.content }}
          className="content"
        ></div>
      </div>
      <Footer />
    </>
  );
};

const styles2 = {
  container: {
    maxWidth: "800px",
    width: "90%",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    lineHeight: "1.8",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
    textAlign: "center",
    color: "#333",
  },
  date: {
    fontSize: "14px",
    color: "#777",
    textAlign: "center",
    marginBottom: "20px",
  },
  image: {
    width: "500px",
    maxWidth: "70vw",
    height: "auto",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },

  content: {
    fontSize: "18px",
    textAlign: "justify",
    color: "#444",
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

export default BlogDetail;
