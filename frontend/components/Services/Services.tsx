import { apiGet } from "@/lib/api";
import { Service } from "@/lib/types";
import styles from "./Services.module.scss";

const icons: Record<string, string> = {
  "Sites Vitrine":      "🖥️",
  "Applications Web":  "⚙️",
  "E-commerce":        "🛒",
  "SEO & Référencement": "📈",
};

export default async function Services() {
  const services = await apiGet<Service[]>("/api/services");

  return (
    <section className={styles.services} id="services">
      <div className={styles.header}>
        <p className={styles.label}>NOS SERVICES</p>
        <h2>Ce que nous faisons</h2>
      </div>
      <div className={styles.grid}>
        {services.map((s) => (
          <div key={s.id} className={styles.card}>
            <span className={styles.icon}>{icons[s.title] ?? "🔧"}</span>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <a href="#contact" className={styles.link}>En savoir plus →</a>
          </div>
        ))}
      </div>
    </section>
  );
}