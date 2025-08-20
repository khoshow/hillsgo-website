import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
import { useUser } from "../../../contexts/UserContext"; // Import your UserContext
import Header from "@/components/Header";
import AdminLayout from "@/components/layout/AdminLayout"; // Assuming you have a layout for Estore
import Admin from "@/components/auth/Admin";

export default function Workers() {
  const { user, loading: userLoading } = useUser(); // Access the user context

  const router = useRouter();
  const storage = getStorage();

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1>Banner Management</h1>
          <div style={styles.sectionContainer}>
            <h3>Home Screen</h3>
            <div style={styles.productGrid}>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/home-banner/add-home-banner`)
                  }
                >
                  Add Home Banner
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/home-banner/home-banners-list`)
                  }
                >
                  Banners List
                </button>
              </div>

              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/home-banner/add-banner`)
                  }
                >
                  Add Home Banner 2.0
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/home-banner/banners-list`)
                  }
                >
                  Banners List 2.0
                </button>
              </div>
            </div>
          </div>

          <div style={styles.sectionContainer}>
            <h3>Estores</h3>
            <div style={styles.productGrid}>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/estores-banner/add-banner`)
                  }
                >
                  Add Estores Banner
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/estores-banner/banners-list`)
                  }
                >
                  Estores Banners List
                </button>
              </div>
            </div>
          </div>

          <div style={styles.sectionContainer}>
            <h3>Hire Skills</h3>
            <div style={styles.productGrid}>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/hire-skills-banner/add-banner`)
                  }
                >
                  Add Hire Skills Banner
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(
                      `/admin/banners/hire-skills-banner/banners-list`
                    )
                  }
                >
                  Hire Skills Banners List
                </button>
              </div>
            </div>
          </div>

          <div style={styles.sectionContainer}>
            <h3>Pick & Drop</h3>
            <div style={styles.productGrid}>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/pick-drop-banner/add-banner`)
                  }
                >
                  Add P&D Banner
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/banners/pick-drop-banner/banners-list`)
                  }
                >
                  P&D Banners List
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    color: "#1f2937",
  },

  sectionContainer: {
    paddingTop: "32px",
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
