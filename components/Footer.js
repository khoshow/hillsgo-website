import { useEffect, useState } from "react";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="footer">
      <div
        className="container navbar"
        style={{ justifyContent: "space-between", padding: "10px 20px" }}
      >
        <div className="logo">
          <Link href="/">
            <img
              src="/assets/images/logo-rectangle.png"
              width="100"
              alt="Logo"
              style={{ cursor: "pointer" }}
            />
          </Link>
        </div>
        <nav>
          <ul className="footerNavLinks">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
