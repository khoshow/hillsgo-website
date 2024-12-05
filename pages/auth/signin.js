// pages/login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { auth, db } from "../../firebase/firebase";
import Footer from "@/components/Footer";

const API = process.env.API_DOMAIN_SERVER;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [roleOption, setRoleOption] = useState("");
  const [roleDisplay, setRoleDisplay] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRoleChange = (role) => {
    console.log("Role selected:", role);
    if (role === "storeOwner") {
      router.push("/auth/store-owner-signin");
    }
    if (role === "skilledWorker") {
      router.push("/auth/skilled-worker-signin");
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <h1 style={styles.heading}>
            {roleOption === "storeOwner"
              ? "Store Owner Login"
              : roleOption === "skilledWorker"
              ? "Skilled Worker Login"
              : "Login"}
          </h1>

          {roleDisplay && <p style={styles.prompt}>Please select your role:</p>}
        </div>
        <>
          <div>
            <input
              type="radio"
              id="option1"
              name="options"
              value="storeOwner"
              checked={roleOption === "storeOwner"}
              onChange={() => handleRoleChange("storeOwner")}
            />
            <label htmlFor="option1">Store Owner</label>
          </div>
          <div>
            <input
              type="radio"
              id="option2"
              name="options"
              value="skilledWorker"
              checked={roleOption === "skilledWorker"}
              onChange={() => handleRoleChange("skilledWorker")}
            />
            <label htmlFor="option2">Skilled Worker</label>
          </div>
        </>
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
    padding: "20px",
    textAlign: "center",
    height: "80vh",
  },

  bodyContent: {
    flex: 1,
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
