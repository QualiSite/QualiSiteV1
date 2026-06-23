"use client";
import { useState } from "react";
import styles from "./Portfolio.module.scss";

type Category = "Tous" | "Site Vitrine" | "E-commerce" | "App Web";

const projects = [
  { title: "Artisan Menuisier", category: "Site Vitrine" },
  { title: "Boutique Bio",      category: "E-commerce" },
  { title: "Le Savoyard",       category: "Site Vitrine" },
  { title: "Agence Immo",       category: "App Web" },
  { title: "Cabinet Médical",   category: "App Web" },
  { title: "Studio Photo",      category: "Site Vitrine" },
];

const filters: Category[] = ["Tous", "Site Vitrine", "E-commerce", "App Web"];

export default function Portfolio() {
  const [active, setActive] = useState<Category>("Tous");

  const visible = active === "Tous"
    ? projects
    : projects.filter((p) => p.category === active);

  return (
    <section className={styles.section} id="portfolio">
      <div className={styles.header}>
        <p className={styles.label}>PORTFOLIO</p>
        <h2>Nos réalisations</h2>
      </div>

      <div className={styles.filters}>
        {filters.map((f) => (
          <button
            key={f}
            className={`${styles.filter} ${active === f ? styles.activeFilter : ""}`}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visible.map((p) => (
          <div key={p.title} className={styles.card}>
            <div className={styles.placeholder} />
            <div className={styles.info}>
              <span className={styles.category}>{p.category}</span>
              <h3>{p.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}