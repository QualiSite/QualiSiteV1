"use client";
import { useState } from "react";
import { Project } from "@/lib/types";
import styles from "./Portfolio.module.scss";

type Category = "Tous" | string;

export default function PortfolioClient({ projects }: { projects: Project[] }) {
  const categories = ["Tous", ...Array.from(new Set(
    projects.flatMap((p) => p.services.map((s) => s.service.title))
  ))];

  const [active, setActive] = useState<Category>("Tous");

  const visible = active === "Tous"
    ? projects
    : projects.filter((p) =>
        p.services.some((s) => s.service.title === active)
      );

  return (
    <>
      <div className={styles.filters}>
        {categories.map((c) => (
          <button
            key={c}
            className={`${styles.filter} ${active === c ? styles.activeFilter : ""}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visible.map((p) => (
          <div key={p.id} className={styles.card}>
            <div className={styles.placeholder} />
            <div className={styles.info}>
              <span className={styles.category}>
                {p.services.map((s) => s.service.title).join(", ")}
              </span>
              <h3>{p.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}