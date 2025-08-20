import { useEffect, useState } from "react";
import { db } from "../../../../firebase/firebase"; // adjust path if needed
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useRouter } from "next/router";
import Header from "@/components/Header";

import AdminLayout from "@/components/layout/AdminLayout";
import Admin from "@/components/auth/Admin";

export default function ListCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(db, "estoresCategories"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 className="text-2xl font-bold mb-6">Estore Categories</h1>

          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div style={styles.grid}>
              {categories.map((cat) => (
                <div key={cat.id} style={styles.card}>
                  <img
                    src={cat.bannerImage}
                    alt={`${cat.name} banner`}
                    style={styles.banner}
                  />
                  <div style={styles.cardContent}>
                    <img
                      src={cat.iconImage}
                      alt={`${cat.name} icon`}
                      style={styles.icon}
                    />
                    <h2 style={styles.name}>{cat.name}</h2>
                    <p style={styles.categoryId}>ID: {cat.categoryId}</p>
                  </div>
                  <button
                    style={styles.editButton}
                    onClick={() =>
                      router.push(`/admin/estores/categories/${cat.id}`)
                    }
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </Admin>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Arial', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  banner: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "1rem",
    textAlign: "center",
  },
  icon: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
    margin: "0 auto 0.5rem",
  },
  name: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  categoryId: {
    fontSize: "14px",
    color: "#777",
  },
};
