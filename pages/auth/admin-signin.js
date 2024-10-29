import { useState } from "react";
import Head from "next/head";
// import { signInWithEmailAndPassword } from "firebase/auth";
import Header from "../../components/Header";
import { useRouter } from "next/router";
// import { auth, db } from "../../firebase/firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";
import { setCookie } from "nookies";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleStoreOwnerLogin = async (e) => {
    console.log("hUI");
    // e.preventDefault();
    // setError(null);
    // if (email === "khoshow.developer@gmail.com") {
    //   try {
    //     // Authenticate the user
    //     const userCredential = await signInWithEmailAndPassword(
    //       auth,
    //       email,
    //       password
    //     );
    //     const user = userCredential.user;
    //     console.log("owner ", userCredential);

    //     // Check if the user exists in the 'estore' collection
    //     const estoreRef = collection(db, "user"); // Reference the collection
    //     const estoreQuery = query(estoreRef, where("user", "==", user.uid));
    //     const querySnapshot = await getDocs(estoreQuery);

    //     if (!querySnapshot.empty) {
    //       // Get the store owner details

    //       // Redirect to the dashboard after successful login and cookie setting
    //       router.push("/admin/dashboard");
    //     } else {
    //       throw new Error("You are not registered as a store owner.");
    //     }
    //   } catch (error) {
    //     setError(error.message);
    //   }
    // } else {
    //   alert("Hi");
    // }
  };

  return (
    <>
      <Head>
        <title>HillsGo || Admin Dashboard </title>
        <meta name="description" content="HillsGo || JJJJJ Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <Header />
      <div style={styles.container}>
        <main className={styles.main}>
          <section className={styles.hero}>
            <p
              style={{
                color: "black",
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
              }}
            >
              Admin
            </p>

            <form onSubmit={handleStoreOwnerLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
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
          </section>
        </main>
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
