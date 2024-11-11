import React, { useState } from 'react';
import Link from 'next/link';

const Dashboard = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    sidebar: {
      width: isSidebarVisible ? '200px' : '0',
      overflowX: 'hidden',
      backgroundColor: '#333',
      color: 'white',
      position: 'fixed',
      height: '100vh',
      padding: isSidebarVisible ? '20px' : '0',
      transition: 'width 0.3s ease, padding 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarHeader: {
      fontSize: '1.5em',
      marginBottom: '10px',
      opacity: isSidebarVisible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    },
    sidebarList: {
      listStyleType: 'none',
      padding: 0,
    },
    sidebarItem: {
      marginBottom: '10px',
    },
    sidebarLink: {
      color: 'white',
      textDecoration: 'none',
    },
    mainContent: {
      flex: 1,
      padding: '20px',
      marginLeft: isSidebarVisible ? '200px' : '0', // Adjusts main content when sidebar is open
      transition: 'margin-left 0.3s ease',
    },
    menuIcon: {
      fontSize: '2em',
      cursor: 'pointer',
      color: '#333',
      padding: '10px',
      display: 'block',
      marginLeft: '10px',
    },
  };

  // Media query styles for responsive behavior
  const mediaQueryStyles = `
    @media (max-width: 768px) {
      .menu-icon {
        display: block;
      }
      .sidebar {
        width: ${isSidebarVisible ? '200px' : '0'};
        position: fixed;
        z-index: 1000;
        transition: width 0.3s;
      }
      .main-content {
        margin-left: ${isSidebarVisible ? '200px' : '0'};
      }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{mediaQueryStyles}</style>
      
      {/* Hamburger Icon for Mobile */}
      <div style={styles.menuIcon} onClick={toggleSidebar} className="menu-icon">
        &#9776; {/* Unicode for hamburger icon */}
      </div>

      {/* Sidebar Navigation */}
      <nav style={styles.sidebar} className="sidebar">
        <h2 style={styles.sidebarHeader}>Dashboard</h2>
        <ul style={styles.sidebarList}>
          <li style={styles.sidebarItem}>
            <Link href="/estore/dashboard" style={styles.sidebarLink}>
              Dashboard Home
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/estore/add-product" style={styles.sidebarLink}>
              Add Product
            </Link>
          </li>
          <li style={styles.sidebarItem}>
            <Link href="/estore/my-products" style={styles.sidebarLink}>
              My Products
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContent} className="main-content">{children}</main>
    </div>
  );
};

export default Dashboard;
