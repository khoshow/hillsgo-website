// pages/login.js
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { useUser } from "../../contexts/UserContext";
import { auth, db } from "../../firebase/firebase";
import Admin from "../../components/auth/Admin";
import AdminLayout from "../../components/layout/AdminLayout";

const API = process.env.API_DOMAIN_SERVER;

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [roleOption, setRoleOption] = useState("");
  const [roleDisplay, setRoleDisplay] = useState(true);
  const [loading, setLoading] = useState(true);

  const { user, setUser } = useUser();
  const router = useRouter();

  return (
    <Admin>
      <AdminLayout>
        <Header />
        <div style={styles.container}>
          <h1 style={styles.heading}>Ongoing Orders Management</h1>
          <div style={styles.productGrid}>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/orders/ongoing-orders`)}
              >
                Estores Orders
              </button>
            </div>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/workers/ongoing`)}
              >
                Hire Skills
              </button>
            </div>
            <div style={styles.productCard}>
              <button
                style={styles.editButton}
                onClick={() => router.push(`/admin/pick-drop/ongoing`)}
              >
                Pick Drop
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Admin>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    // textAlign: "center",
  },
  heading: {
    fontSize: "25px",
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
