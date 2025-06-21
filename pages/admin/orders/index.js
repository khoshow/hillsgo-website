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
          <h1>Orders Management</h1>
          <div style={styles.sectionContainer}>
            <h3>Estores</h3>
            <div style={styles.productGrid}>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/estores/orders/ongoing-orders`)
                  }
                >
                  Ongoing Orders
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() =>
                    router.push(`/admin/estores/orders/orders-history`)
                  }
                >
                  Orders History
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
                  onClick={() => router.push(`/admin/hire-skills/create-new`)}
                >
                  New Hire Skills
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() => router.push(`/admin/hire-skills/ongoing`)}
                >
                  Ongoing Orders
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() => router.push(`/admin/hire-skills/history`)}
                >
                  Orders History
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
                  onClick={() => router.push(`/admin/pick-drop/create-new`)}
                >
                  New Pick & Drop
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() => router.push(`/admin/pick-drop/ongoing`)}
                >
                  Ongoing Orders
                </button>
              </div>
              <div style={styles.productCard}>
                <button
                  style={styles.editButton}
                  onClick={() => router.push(`/admin/pick-drop/history`)}
                >
                  Orders History
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
  heading: {
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "32px",
  },
  sectionContainer: {
    paddingTop: "32px",
  },
  productGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "32px",
  },
  productCard: {
    // flex: "1 1 240px",
    backgroundColor: "#ffffff",
    // padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
};
