import React, { useState } from "react";
import Link from "next/link";

const DriverLayout = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
    },
    sidebar: {
      width: "200px",
      backgroundColor: "#333",
      color: "white",
      height: "100vh",
      padding: "20px",
      flexShrink: 0,
      transition: "transform 0.3s ease",
    },
    sidebarHidden: {
      transform: "translateX(-100%)", // Hide sidebar off-screen for mobile
    },
    sidebarHeader: {
      fontSize: "1.5em",
      marginBottom: "10px",
    },
    sidebarList: {
      listStyleType: "none",
      padding: 0,
    },
    sidebarItem: {
      marginBottom: "10px",
    },
    sidebarLink: {
      color: "white",
      textDecoration: "none",
    },
    mainContent: {
      flex: 1,
    },
    menuIcon: {
      fontSize: "2em",
      cursor: "pointer",
      color: "#333",
      backgroundColor: "#95D500",
      position: "absolute",

      right: "20px",
      width: "50px",
      height: "50px",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1001",
    },
  };

  // Media query styles for responsive behavior
  const mediaQueryStyles = `
    @media (max-width: 768px) {
      .menu-icon {
        display: flex; /* Show menu icon on mobile */
        right: "20px",
           zIndex: "2000",
      }
      .sidebar {
        width: 200px;
        position: fixed;
        transform: ${isSidebarVisible ? "translateX(0)" : "translateX(-100%)"};
        z-index: 1000;
      }
      .main-content {
        margin-left: 0;
      }
    }
       @media (min-width: 768px) {
      .menu-icon {
        display: none; /* Show menu icon on mobile */
        right: "20px",
           zIndex: "2000",
      }
      
    }
  `;

  return (
    <div style={styles.container}>
      <style>{mediaQueryStyles}</style>

      {/* Hamburger Icon for Mobile */}
      <div
        style={styles.menuIcon}
        onClick={toggleSidebar}
        className="menu-icon"
      >
        &#9776; {/* Unicode for hamburger icon */}
      </div>

      {/* Sidebar Navigation */}
      <nav
        style={{
          ...styles.sidebar,
          ...(isSidebarVisible || window.innerWidth > 768
            ? {}
            : styles.sidebarHidden),
        }}
        className="sidebar"
      >
        <h2 style={styles.sidebarHeader}>Dashboard</h2>
        <ul style={styles.sidebarList}>
          <li style={styles.sidebarItem}>
            <Link href="/admin/dashboard" style={styles.sidebarLink}>
              Dashboard Home
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/admin/orders" style={styles.sidebarLink}>
              Orders
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/admin/estores" style={styles.sidebarLink}>
              E-Stores
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/admin/workers" style={styles.sidebarLink}>
              Workers
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/admin/drivers" style={styles.sidebarLink}>
              Drivers
            </Link>
          </li>

          <li style={styles.sidebarItem}>
            <Link href="/admin/push-notifications" style={styles.sidebarLink}>
              Notifications
            </Link>
          </li>

          <li style={styles.sidebarItem}>
            <Link href="/admin/home-banner" style={styles.sidebarLink}>
              Home Banner
            </Link>
          </li>

          {/* Add more links as needed */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContent} className="">
        {children}
      </main>
    </div>
  );
};

export default DriverLayout;
