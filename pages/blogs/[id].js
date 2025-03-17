import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BlogDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog(docSnap.data());
        } else {
          console.error("No such blog!");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
      setLoading(false);
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>{blog.title}</h1>
        <p style={styles.date}>
          {new Date(blog.createdAt.seconds * 1000).toDateString()}
        </p>
        <img src={blog.imageUrl} alt={blog.title} style={styles.image} />
        <div
          style={styles.content}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
    textAlign: "center",
  },
  date: {
    fontSize: "14px",
    color: "#777",
    textAlign: "center",
    marginBottom: "20px",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  content: {
    fontSize: "16px",
    lineHeight: "1.6",
  },
};

export default BlogDetail;
