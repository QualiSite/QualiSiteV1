import Link from "next/link";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.quali}>Quali</span>
          <span className={styles.site}>Site</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="#services">Services</Link>
          <Link href="#portfolio">Portfolio</Link>
          <Link href="#apropos">À propos</Link>
          <Link href="#contact">Contact</Link>
        </nav>

        <div className={styles.right}>
          <Link href="/admin" className={styles.adminLink}>Admin</Link>
          <Link href="#contact" className={styles.cta}>Devis gratuit</Link>
        </div>      </div>
    </header>
  );
}