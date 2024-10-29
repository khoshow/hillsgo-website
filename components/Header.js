import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css"; // Ensure the path is correct
import Link from "next/link";
// import { auth } from "../firebase/firebase"; // Ensure auth is correctly imported
import nookies from "nookies";
import { useRouter } from "next/router"; // Import useRouter

const Header = () => {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const router = useRouter(); // Initialize router

  // useEffect(() => {
  //   // Listen for authentication state changes
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setIsAuthenticated(!!user); // Set to true if user is logged in, false otherwise
  //   });
  //   return () => unsubscribe(); // Clean up on component unmount
  // }, []);

  // const handleSignOut = async () => {
  //   try {
  //     await auth.signOut(); // Log out the user
  //     const allCookies = nookies.get();
  //     Object.keys(allCookies).forEach((cookieName) => {
  //       nookies.destroy(null, cookieName, { path: "/" });
  //     });

  //     // Redirect to the homepage after sign out
  //     router.push("/"); // Ensure router is available
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //   }
  // };

  return (
    <header className={styles.navbar}>
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
              <Link href="/contact">Contact</Link>
            </li>
            {/* <li>
              {isAuthenticated ? (
                <button className="button" onClick={handleSignOut}>
                  Log Out
                </button>
              ) : (
                <Link href="/auth/signin">Sign In</Link>
              )}
            </li> */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
