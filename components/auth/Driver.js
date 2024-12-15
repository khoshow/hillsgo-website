// components/Admin.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../contexts/UserContext";

const Driver = ({ children }) => {
  const { user, loading } = useUser();
  const router = useRouter();
  console.log("User in Admin:", user);

  useEffect(() => {
    // Redirect if no user is authenticated or user is not driver
    if (!loading && (!user || user.role !== "driver")) {
      router.push("/"); // Redirect to homepage
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show loading while checking user role
  }

  return user?.role === "driver" ? children : null; // Render children only for driver
};

export default Driver;
