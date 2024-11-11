// components/AdminLayout.js
import React, { useState } from "react";
import Link from "next/link";

const AdminLayout = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      position: "relative",
      backgroundColor: "#f8f9fa",
    },
    sidebar: {
      width: isSidebarVisible ? "250px" : "0",
      overflowX: "hidden",
      backgroundColor: "#3a3d42",
      color: "#d3d6db",
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
      color: "#ffffff",
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
      color: "#d3d6db",
      textDecoration: "none",
      fontWeight: 500,
      transition: "color 0.2s",
    },
    mainContent: {
      flex: 1,
      padding: "20px",
      overflowY: "auto",
      backgroundColor: "#f0f2f5",
      marginLeft: isSidebarVisible ? "250px" : "0",
      transition: "margin-left 0.3s ease",
      color: "#333",
    },
    menuIcon: {
      fontSize: "2em",
      color: "#333",
      cursor: "pointer",
      padding: "10px",
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: 1001,
      display: "none", // Default to hidden on larger screens
    },
  };

  const mediaQueryStyles = `
    @media (max-width: 768px) {
      .menu-icon {
        display: block !important;
      }
      .sidebar {
        width: ${isSidebarVisible ? "250px" : "0"};
        position: fixed;
        transition: width 0.3s;
      }
      .main-content {
        margin-left: ${isSidebarVisible ? "250px" : "0"};
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{mediaQueryStyles}</style>

      {/* Hamburger Icon for Mobile */}
      <div
        style={{ ...styles.menuIcon, display: "block" }} // Ensures visibility on small screens
        onClick={toggleSidebar}
        className="menu-icon"
      >
        &#9776; {/* Hamburger icon */}
      </div>

      {/* Sidebar Navigation */}
      <nav style={styles.sidebar} className="sidebar">
        <h2 style={styles.sidebarHeader}>Dashboard</h2>
        <ul style={styles.sidebarList}>
          <li style={styles.sidebarItem}>
            <Link href="/admin/dashboard" style={styles.sidebarLink}>
              Dashboard Home
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/admin/estores/add-estores" style={styles.sidebarLink}>
              Add E-Store
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/admin/workers/add-workers" style={styles.sidebarLink}>
              Add Workers
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContent} className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
