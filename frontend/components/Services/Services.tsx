import styles from "./Services.module.scss";

const services = [
  {
    icon: "🖥️",
    title: "Sites Vitrine",
    description: "Des sites élégants qui reflètent votre image et convertissent vos visiteurs en clients.",
  },
  {
    icon: "⚙️",
    title: "Applications Web",
    description: "Des outils sur-mesure pour automatiser et digitaliser vos processus métier.",
  },
  {
    icon: "🛒",
    title: "E-commerce",
    description: "Des boutiques en ligne performantes, pensées pour l'expérience d'achat.",
  },
  {
    icon: "📈",
    title: "SEO & Référencement",
    description: "Optimisez votre visibilité et attirez un trafic qualifié sur les moteurs de recherche.",
  },
];

export default function Services() {
  return (
    <section className={styles.services} id="services">
      <div className={styles.header}>
        <p className={styles.label}>NOS SERVICES</p>
        <h2>Ce que nous faisons</h2>
      </div>
      <div className={styles.grid}>
        {services.map((s) => (
          <div key={s.title} className={styles.card}>
            <span className={styles.icon}>{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <a href="#contact" className={styles.link}>En savoir plus →</a>
          </div>
        ))}
      </div>
    </section>
  );
}