import { useEffect } from "react";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { auth } from "../firebase/firebase";
import { parseCookies, destroyCookie } from "nookies";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";

const Header = () => {
  const { user, setUser } = useUser();
  const isAuthenticated = !!user;
  const router = useRouter();

  // ✅ Restore user from localStorage if not already in context
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.email && parsedUser?.token && parsedUser?.role) {
            setUser(parsedUser);
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }
  }, [user, setUser]);

  const handleSignOut = async () => {
    const confirmed = confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      const allCookies = parseCookies();
      Object.keys(allCookies).forEach((cookieName) => {
        destroyCookie(null, cookieName, { path: "/" });
      });

      auth.onAuthStateChanged((user) => {
        if (!user) {
          router.push("/");
        }
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDashboard = () => {
    if (!user) {
      alert("Please sign in first.");
      router.push("/auth/signin");
      return;
    }

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
            {isAuthenticated && (
              <li>
                <a onClick={handleDashboard} style={{ cursor: "pointer" }}>
                  Dashboard
                </a>
              </li>
            )}
            <li>
              {isAuthenticated ? (
                <a onClick={handleSignOut} style={{ cursor: "pointer" }}>
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

// import { useEffect, useState } from "react";
// import styles from "../styles/Home.module.css"; // Ensure the path is correct
// import Link from "next/link";
// import { auth } from "../firebase/firebase"; // Ensure auth is correctly imported
// import { parseCookies, setCookie, destroyCookie } from "nookies";
// import { useRouter } from "next/router"; // Import useRouter
// import { useUser } from "@/contexts/UserContext";

// const Header = () => {
//   const { user, setUser } = useUser();
//   const isAuthenticated = !!user;
//   const router = useRouter(); // Initialize router

//   console.log("user", user);

//   const handleSignOut = async () => {
//     const confirmed = confirm("Are you sure you want to lg out?");
//     if (!confirmed) return;
//     try {
//       await auth.signOut(); // Log out the user
//       // localStorage.clear();
//       localStorage.removeItem("user");
//       const allCookies = parseCookies();

//       Object.keys(allCookies).forEach((cookieName) => {
//         destroyCookie(null, cookieName, { path: "/" });
//       });

//       // Redirect to the homepage after sign out
//       // router.push("/"); // Ensure router is available

//       auth.onAuthStateChanged((user) => {
//         if (!user) {
//           router.push("/"); // Redirect only after sign-out is confirmed
//         }
//       });
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   const handleDashboard = async () => {
//     if (!user) {
//       alert("Please sign in first.");
//       router.push("/auth/signin");
//       return;
//     }
//     const userRole = user.role;
//     if (userRole === "estore") {
//       router.push("/estore/dashboard");
//     } else if (userRole === "worker") {
//       router.push("/skilled-worker/dashboard");
//     } else if (userRole === "admin") {
//       router.push("/admin/dashboard");
//     } else if (userRole === "driver") {
//       router.push("/driver/dashboard");
//     } else {
//       router.push("/");
//     }
//   };

//   return (
//     <header className="navbar">
//       <div className="container navbar">
//         <div className={styles.logo}>
//           <Link href="/">
//             <img
//               src="/assets/images/logo-rectangle.png"
//               width="100"
//               alt="Logo"
//             />
//           </Link>
//         </div>
//         <nav className="ml-auto">
//           <ul className={styles.navLinks}>
//             <li>
//               <Link href="/">Home</Link>
//             </li>
//             <li>
//               <Link href="/about">About</Link>
//             </li>
//             <li>
//               <Link href="/blogs/list">Blogs</Link>
//             </li>
//             <li>
//               <Link href="/contact">Contact</Link>
//             </li>
//             {isAuthenticated ? (
//               <li>
//                 <a
//                   className=""
//                   onClick={() => handleDashboard()}
//                   style={{ cursor: "pointer" }}
//                 >
//                   Dashboard
//                 </a>
//               </li>
//             ) : (
//               ""
//             )}
//             <li>
//               {isAuthenticated ? (
//                 <a
//                   className=" "
//                   onClick={handleSignOut}
//                   style={{ cursor: "pointer" }}
//                 >
//                   Log Out
//                 </a>
//               ) : (
//                 <Link href="/auth/signin">Sign In</Link>
//               )}
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;
