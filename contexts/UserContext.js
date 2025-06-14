import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // First: restore from localStorage once
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // mark as initialized
  }, []);

  // Then: only update localStorage after initial load
  useEffect(() => {
    if (loading) return; // don't run during initial restoration

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      // localStorage.removeItem("user");
      localStorage.removeItem("user");
    }
  }, [user, loading]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
