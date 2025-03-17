import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css"; // Ensure the path is correct
import Link from "next/link";
import { auth } from "../firebase/firebase"; // Ensure auth is correctly imported
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { useRouter } from "next/router"; // Import useRouter
import { useUser } from "@/contexts/UserContext";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter(); // Initialize router
  const { user, setUser } = useUser();
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Set to true if user is logged in, false otherwise
    });
    return () => unsubscribe(); // Clean up on component unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Log out the user
      localStorage.clear();
      const allCookies = parseCookies();

      Object.keys(allCookies).forEach((cookieName) => {
        destroyCookie(null, cookieName, { path: "/" });
      });

      // Redirect to the homepage after sign out
      // router.push("/"); // Ensure router is available

      auth.onAuthStateChanged((user) => {
        if (!user) {
          router.push("/"); // Redirect only after sign-out is confirmed
        }
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDashboard = async () => {
    const userRole = user.role;
    if (userRole === "estore") {
      router.push("/estore/dashboard");
    } else if (userRole === "worker") {
      router.push("/skilled-worker/dashboard");
    } else if (userRole === "admin") {
      router.push("/admin/dashboard");
    } else if (userRole === "driver") {
      router.push("/driver/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar">
        <div className={styles.logo}>
          <Link href="/">
            <img
              src="/assets/images/logo-rectangle.png"
              width="100"
              alt="Logo"
            />
          </Link>
        </div>
        <nav className="ml-auto">
          <ul className={styles.navLinks}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/blogs/list">Blogs</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            {isAuthenticated ? (
              <li>
                <a
                  className=""
                  onClick={() => handleDashboard()}
                  style={{ cursor: "pointer" }}
                >
                  Dashboard
                </a>
              </li>
            ) : (
              ""
            )}
            <li>
              {isAuthenticated ? (
                <a
                  className=" "
                  onClick={handleSignOut}
                  style={{ cursor: "pointer" }}
                >
                  Log Out
                </a>
              ) : (
                <Link href="/auth/signin">Sign In</Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
