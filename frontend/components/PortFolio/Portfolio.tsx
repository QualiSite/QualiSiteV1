import { apiGet } from "@/lib/api";
import { Project } from "@/lib/types";
import PortfolioClient from "./PortfolioClient";
import styles from "./Portfolio.module.scss";

export default async function Portfolio() {
  const projects = await apiGet<Project[]>("/api/projects");

  return (
    <section className={styles.section} id="portfolio">
      <div className={styles.header}>
        <p className={styles.label}>PORTFOLIO</p>
        <h2>Nos réalisations</h2>
      </div>
      <PortfolioClient projects={projects} />
    </section>
  );
}