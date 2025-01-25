// components/Admin.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../contexts/UserContext";

const Estore = ({ children }) => {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect if no user is authenticated or user is not an admin
    if (!loading && (!user || user.role !== "estore")) {
      router.push("/"); // Redirect to homepage
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show loading while checking user role
  }

  return user?.role === "estore" ? children : null; // Render children only for estore
};

export default Estore;
