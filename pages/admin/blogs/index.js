import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";

export default function Estores() {
  const { user, loading: userLoading } = useUser(); // Access the user context

  const router = useRouter();
  const storage = getStorage();

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.heading}>Blogs Management</h1>
          <div style={styles.productGrid}>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/blogs/create-blog`)}
              >
                Add Blog
              </button>
            </div>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/blogs/drivers-list`)}
              >
                Blogs List
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "2.5em",
    marginBottom: "20px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },

  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  productName: {
    fontSize: "1.5em",
    margin: "10px 0",
  },
  productPrice: {
    fontSize: "1.2em",
    color: "#e67e22",
  },
  productDescription: {
    fontSize: "0.9em",
    color: "#7f8c8d",
  },
  editButton: {
    marginRight: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
