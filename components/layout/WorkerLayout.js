// components/DashboardLayout.js
import React from "react";
import Link from "next/link"; // For sample navigation links

const WorkerLayout = ({ children }) => {
  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <nav style={styles.sidebar}>
        <h2 style={styles.sidebarHeader}>Dashboard</h2>
        <ul style={styles.sidebarList}>
          <li style={styles.sidebarItem}>
            <Link href="/skilled-worker/dashboard" style={styles.sidebarLink}>
              Dashboard Home
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/skilled-worker/add-post" style={styles.sidebarLink}>
              Add Post
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/skilled-worker/my-posts" style={styles.sidebarLink}>
              My Posts
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
};

export default WorkerLayout;

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#2e3b4e",
    color: "white",
    padding: "20px",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
  },
  sidebarHeader: {
    marginBottom: "20px",
    fontSize: "1.5rem",
  },
  sidebarList: {
    listStyle: "none",
    padding: 0,
  },
  sidebarItem: {
    margin: "10px 0",
  },
  sidebarLink: {
    color: "#cfd8dc",
    textDecoration: "none",
    fontWeight: 500,
  },
  mainContent: {
    flex: 1,

    overflowY: "auto",
    backgroundColor: "#f5f5f5",
  },
};
