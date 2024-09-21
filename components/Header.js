import styles from "../styles/Home.module.css";
import Link from "next/link";

const Header = () => {
  return (
    <div>
      <header className={`${styles.navbar} `}>
        <div className="container navbar">
          <div className={styles.logo}>
            <Link href="/">
              <img src="/assets/images/logo-rectangle.png" width="100"></img>
            </Link>
          </div>
          <nav className="ml-auto">
            <ul className={styles.navLinks}>
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
      </header>
    </div>
  );
};

export default Header;
