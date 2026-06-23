import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} QualiSite. Tous droits réservés.</p>
      <p>contact@qualisite.fr | +33 1 23 45 67 89</p>
    </footer>
  );
}