// components/Admin.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../contexts/UserContext";

const Worker = ({ children }) => {
  const { user, loading } = useUser();
  const router = useRouter();
  console.log("User in Worker:", user);

  useEffect(() => {
    // Redirect if no user is authenticated or user is not an admin
    if (!loading && (!user || user.role !== "worker")) {
      router.push("/"); // Redirect to homepage
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show loading while checking user role
  }

  return user?.role === "worker" ? children : null; // Render children only for estore
};

export default Worker;
