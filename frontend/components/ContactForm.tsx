"use client";
import { useState } from "react";
import styles from "./ContactForm.module.scss";

const projectTypes = [
  "Site Vitrine",
  "Application Web",
  "E-commerce",
  "SEO & Référencement",
  "Autre",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>

        <div className={styles.info}>
          <p className={styles.label}>CONTACT</p>
          <h2>Parlons de votre projet</h2>
          <p className={styles.subtitle}>
            Un projet web en tête ? Décrivez-le nous et nous vous recontactons
            sous 24h avec une estimation personnalisée et gratuite.
          </p>
          <ul className={styles.details}>
            <li>📍 France (remote) / Montréal</li>
            <li>✉️ contact@qualisite.fr</li>
            <li>📞 +33 6 XX XX XX XX</li>
          </ul>
        </div>

        <div className={styles.formWrap}>
          {submitted ? (
            <div className={styles.success}>
              <p>✅ Message envoyé ! On revient vers vous sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="nom">NOM *</label>
                  <input id="nom" type="text" placeholder="Votre nom" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">EMAIL *</label>
                  <input id="email" type="email" placeholder="votre@email.fr" required />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="type">TYPE DE PROJET</label>
                <select id="type">
                  <option value="">Sélectionnez...</option>
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="message">MESSAGE *</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Décrivez votre projet, vos objectifs..."
                  required
                />
              </div>
              <p className={styles.rgpd}>
                🔒 Données traitées conformément au RGPD — jamais revendues.
              </p>
              <button type="submit" className={styles.submit}>
                Envoyer ma demande →
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}