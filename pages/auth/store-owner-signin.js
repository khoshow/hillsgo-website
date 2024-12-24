import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { useUser } from "@/contexts/UserContext";
import { auth, db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_DOMAIN_SERVER;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const router = useRouter();

  const handleStoreOwnerLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      // Query Firestore for additional user info in the 'estores' collection
      const estoreQuery = query(
        collection(db, "estores"),
        where("ownerEmail", "==", userCredential.user.email)
      );
      const estoreSnapshot = await getDocs(estoreQuery);

      if (!estoreSnapshot.empty) {
        // Get the first matching document data
        const estoreData = estoreSnapshot.docs[0].data();

        // Set the user in context with additional details
        setUser({
          email: userCredential.user.email,
          token: idToken,
          name: estoreData.ownerName,
          image: estoreData.imageUrl,
          role: estoreData.role,
          estoreName: estoreData.estoreName,
          estoreContact: estoreData.estoreContact,
          uid: estoreData.ownerId,
        });

        router.push("/estore/dashboard"); // Redirect after successful login
      } else {
        alert("You are not authorized to access this section.");
        auth.signOut();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <form onSubmit={handleStoreOwnerLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email of Store Owner</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "50px 0",
    textAlign: "center",
    height: "80vh",
  },

  headerContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  prompt: {
    fontSize: "18px",
    color: "#666",
  },
  highlight: {
    fontWeight: "bold",
    color: "#0070f3", // Blue highlight for roles
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};
