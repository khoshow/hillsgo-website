import "@/styles/globals.css"; // Ensure this path is correct
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import { auth } from "../firebase/firebase";
import nookies from "nookies";
import Header from "../components/Header"; // Import the Header component

export default function App({ Component, pageProps }) {
  // const router = useRouter();
  // const [loading, setLoading] = useState(true);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setIsAuthenticated(!!user);
  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

  // useEffect(() => {
  //   if (
  //     !loading &&
  //     !isAuthenticated &&
  //     router.pathname.startsWith("/protected")
  //   ) {
  //     router.push("/auth/signin");
  //   }
  // }, [loading, isAuthenticated, router.pathname]);

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
