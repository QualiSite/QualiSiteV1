import styles from "./Testimonials.module.scss";

const testimonials = [
  {
    quote:
      "QualiSite a transformé mon activité. Mon site est magnifique et j'ai doublé mes demandes en 3 mois.",
    name: "Marie Dupont",
    role: "Artisane, Lyon",
    rating: 5,
  },
  {
    quote:
      "Réactifs, professionnels et à l'écoute. Je recommande vivement pour tout projet digital.",
    name: "Thomas Revel",
    role: "Gérant, Annecy",
    rating: 5,
  },
  {
    quote: "Notre application fonctionne parfaitement. Un vrai gain de temps pour notre cabinet.",
    name: "Sophie Blanc",
    role: "Médecin, Genève",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.label}>TÉMOIGNAGES</p>
        <h2>Ce que disent nos clients</h2>
      </div>
      <div className={styles.grid}>
        {testimonials.map((t) => (
          <div key={t.name} className={styles.card}>
            <div className={styles.stars}>{"★".repeat(t.rating)}</div>
            <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>
            <div className={styles.author}>
              <span className={styles.name}>{t.name}</span>
              <span className={styles.role}>{t.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
