// pages/login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { auth, db } from "../../firebase/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [roleOption, setRoleOption] = useState("");
  const [roleDisplay, setRoleDisplay] = useState(true);

  const router = useRouter();

  const handleStoreOwnerLogin = async (e) => {
    console.log("hUI");

    // e.preventDefault();
    // setError(null);

    // try {
    //   const response = await fetch("/api/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password, role: roleOption }),
    //   });

    //   const data = await response.json();
    //   console.log("response", response);

    //   if (response.ok) {
    //     // Redirect to the specified dashboard
    //     console.log("push", data.redirectPath);

    //     router.push(data.redirectPath);
    //   } else {
    //     console.error("Login error:", data.error);
    //     // Handle login error (show a message, etc.)
    //   }
    // } catch (error) {
    //   setError(error.message);
    // }
  };

  const handleSkilledWorkerLogin = async (e) => {
    console.log("hUI");
    // e.preventDefault();
    // setError(null);
    // try {
    //   await signInWithEmailAndPassword(auth, email, password);
    //   router.push("/hire-skills/dashboard"); // Redirect after successful login
    // } catch (error) {
    //   setError(error.message);
    // }
  };

  const handleRoleChange = (role) => {
    console.log("Role selected:", role);
    setRoleOption(role);
    setRoleDisplay(false);
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

        {roleDisplay ? (
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
        ) : roleOption === "storeOwner" ? (
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
            <button type="submit" style={styles.button}>
              Login
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        ) : roleOption === "skilledWorker" ? (
          <form onSubmit={handleSkilledWorkerLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label>Email of Skilled Worker</label>
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
            <button type="submit" style={styles.button}>
              Login
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        ) : (
          ""
        )}
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
