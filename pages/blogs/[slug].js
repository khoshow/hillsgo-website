import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  query,
  getDocs,
  collection,
  where,
  updateDoc,
  increment,
} from "firebase/firestore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FiShare2 } from "react-icons/fi";

const BlogDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchBlogBySlug = async (slug) => {
      setLoading(true);

      try {
        const q = query(collection(db, "blogs"), where("slug", "==", slug));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Since slug is unique, take the first match
          const docSnap = querySnapshot.docs[0];
          const blogData = { id: docSnap.id, ...docSnap.data() };

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

  useEffect(() => {
    if (!blog?.id) return;

    const blogRef = doc(db, "blogs", blog.id);

    // Increment view count
    updateDoc(blogRef, { viewCount: increment(1) });

    // Fetch updated count
    const fetchViews = async () => {
      const snap = await getDoc(blogRef);
      if (snap.exists()) {
        setViews(snap.data().viewCount || 0);
      }
    };

    fetchViews();
  }, [blog?.id]);

  const handleShare = async () => {
    const url = `https://www.hillsgo.com/blogs/${blog?.slug || ""}`;

    if (navigator.share) {
      // Use native share dialog if available (mobile browsers)
      await navigator.share({
        title: blog?.title || "HillsGo Blog",
        text: "Check out this blog from HillsGo!",
        url,
      });
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const metaDescription = blog?.content
    ? blog.content.replace(/<[^>]+>/g, "").slice(0, 160) + "..."
    : "Read the latest stories, tips, and updates from HillsGo.";

  if (loading) return <p style={styles2.loading}>Loading...</p>;
  if (!blog) return <p style={styles2.error}>Blog not found.</p>;

  return (
    <>
      <Head>
        {/* Basic Meta */}
        <title>
          {blog?.title ? `${blog.title} | HillsGo Blog` : "HillsGo Blog"}
        </title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content="HillsGo, blog, Senapati, e-store, pick & drop, hire skills, community, updates, Manipur"
        />
        <meta name="author" content="HillsGo Team" />

        {/* Open Graph / Facebook */}
        <meta
          property="og:title"
          content={
            blog?.title ? `${blog.title} | HillsGo Blog` : "HillsGo Blog"
          }
        />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://www.hillsgo.com/blogs/${blog?.slug || ""}`}
        />
        <meta
          property="og:image"
          content={blog?.imageUrl || "/assets/logo.png"}
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={
            blog?.title ? `${blog.title} | HillsGo Blog` : "HillsGo Blog"
          }
        />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content={blog?.imageUrl || "/assets/logo.png"}
        />
      </Head>

      <Header />
      <div style={styles2.container}>
        <h1 style={styles2.title}>{blog.title}</h1>

        <p style={styles2.date}>
          {new Date(blog.createdAt.seconds * 1000).toDateString()}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            margin: "1rem 0",
          }}
        >
          <p style={{ margin: 0 }}>👁️ {blog?.viewCount || 0} views</p>
          <button
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            <FiShare2 /> {copied ? "Copied!" : "Share"}
          </button>
        </div>

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
