// components/Admin.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../contexts/UserContext";

const Admin = ({ children }) => {
  const { user, loading } = useUser();
  const router = useRouter();
  const adminEmails = [
    "khoshow.developer@gmail.com",
    "creativekalo1@gmail.com",
    "afinerblue@gmail.com",
    "contact@hillsgo.com",
    "admin@hillsgo.com",
    "amariineemail@gmail.com",
    "pangbilahabent@gmail.com",
    "alicekadete02@gmail.com"


  ];

  useEffect(() => {
    if (!loading && (!user || !adminEmails.includes(user.email))) {
      router.push("/"); // Redirect if no user or not an admin
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // Show loading while waiting for user
  }

  return user ? children : null; // Render children if authenticated and an admin
};

export default Admin;
