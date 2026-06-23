import styles from "./Stats.module.scss";

const stats = [
  { number: "50+", label: "Projets réalisés" },
  { number: "98%", label: "Clients satisfaits" },
  { number: "5+", label: "Années d'expérience" },
];

export default function Stats() {
  return (
    <section className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <div className={styles.number}>{s.number}</div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </section>
  );
}
