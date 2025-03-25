// pages/login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { auth, db } from "../../firebase/firebase";
import { useUser } from "../../contexts/UserContext";

const API = process.env.NEXT_PUBLIC_API_DOMAIN_SERVER;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useUser();
  const [roleOption, setRoleOption] = useState("");
  const [roleDisplay, setRoleDisplay] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const allowedEmails = [
    "khoshow.developer@gmail.com",
    "afinerblue@gmail.com",
    "creativekalo1@gmail.com",
    "roziiveinaihillsgo@gmail.com",
    "contact@hillsgo.com",
  ];

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (allowedEmails.includes(email)) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();

        // Set the user in context
        setUser({
          email: userCredential.user.email,
          token: idToken,
          role: "admin",
        });
        router.push("/admin/dashboard"); // Redirect after successful login
      } else {
        return alert("Hi user");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h3 className="subTitle">Admin</h3>
        <form onSubmit={handleAdminLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email </label>
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />

            <label style={styles.showPassword}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>
          </div>
          <button type="submit" style={styles.button}>
            Login
            {loading ? "Loading..." : ""}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
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
