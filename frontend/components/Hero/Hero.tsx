import styles from "./Hero.module.scss";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <h1>
        Votre présence <span className={styles.accent}>digitale</span>
      </h1>
      <p>sans compromis</p>
      <div className={styles.actions}>
        <a href="#contact" className={`${styles.btn} ${styles.primary}`}>
          Commencer
        </a>
        <a href="#services" className={`${styles.btn} ${styles.secondary}`}>
          En savoir plus
        </a>
      </div>
    </section>
  );
}
