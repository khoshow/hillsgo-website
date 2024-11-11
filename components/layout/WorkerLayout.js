// components/WorkerLayout.js
import React, { useState } from "react";
import Link from "next/link"; // For sample navigation links

const WorkerLayout = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      position: "relative",
    },
    sidebar: {
      width: isSidebarVisible ? "250px" : "0",
      overflowX: "hidden",
      backgroundColor: "#2e3b4e",
      color: "white",
      padding: isSidebarVisible ? "20px" : "0",
      boxShadow: isSidebarVisible ? "2px 0 5px rgba(0, 0, 0, 0.1)" : "none",
      transition: "width 0.3s ease, padding 0.3s ease",
      position: "fixed",
      height: "100vh",
      zIndex: 1000,
    },
    sidebarHeader: {
      fontSize: "1.5rem",
      marginBottom: "20px",
      opacity: isSidebarVisible ? 1 : 0,
      transition: "opacity 0.3s ease",
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
      padding: "20px",
      overflowY: "auto",
      backgroundColor: "#f5f5f5",
      marginLeft: isSidebarVisible ? "250px" : "0",
      transition: "margin-left 0.3s ease",
    },
    menuIcon: {
      fontSize: "2em",
      color: "#2e3b4e",
      cursor: "pointer",
      padding: "10px",
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: 1001,
      display: "block",
    },
  };

  const sidebarStyle = {
    ...styles.sidebar,
    ...(window.innerWidth <= 768
      ? { width: isSidebarVisible ? "250px" : "0" }
      : { width: "250px", position: "relative" }),
  };

  const mainContentStyle = {
    ...styles.mainContent,
    ...(window.innerWidth <= 768
      ? { marginLeft: isSidebarVisible ? "250px" : "0" }
      : { marginLeft: "250px" }),
  };

  return (
    <div style={styles.container}>
      {/* Hamburger Icon for Mobile */}
      <div style={styles.menuIcon} onClick={toggleSidebar}>
        &#9776; {/* Hamburger icon */}
      </div>

      {/* Sidebar Navigation */}
      <nav style={sidebarStyle}>
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
      <main style={mainContentStyle}>{children}</main>
    </div>
  );
};

export default WorkerLayout;
