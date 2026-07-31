"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiAuthGet, apiAuthPatch } from "@/lib/api";
import styles from "./page.module.scss";
import Link from "next/link";

type Status = "NOUVEAU" | "TRAITE" | "ARCHIVE" | "CLIENT";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  initialMessage: string;
  status: Status;
  createdAt: string;
}

const STATUS_LABELS: Record<Status, string> = {
  NOUVEAU: "Nouveau",
  TRAITE: "Traité",
  ARCHIVE: "Archivé",
  CLIENT: "Client",
};

const STATUS_COLORS: Record<Status, string> = {
  NOUVEAU: "#FF6B35",
  TRAITE: "#22c55e",
  ARCHIVE: "#94a3b8",
  CLIENT: "#6366f1",
};

export default function ContactsPage() {
  const { accessToken } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    apiAuthGet<Contact[]>("/api/admin/contacts", accessToken)
      .then(setContacts)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  async function handleStatusChange(id: string, status: Status) {
    if (!accessToken) return;
    try {
      await apiAuthPatch(`/api/admin/contacts/${id}/status`, accessToken, { status });
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {
      alert("Erreur lors de la mise à jour du statut");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>
            ← Dashboard
          </Link>
          <h1>Contacts</h1>
        </div>
        <span className={styles.count}>
          {contacts.length} message{contacts.length > 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : contacts.length === 0 ? (
        <p className={styles.empty}>Aucun contact pour l&apos;instant.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Nom</span>
            <span>Email</span>
            <span>Sujet</span>
            <span>Date</span>
            <span>Statut</span>
          </div>
          {contacts.map((c) => (
            <div key={c.id} className={styles.row}>
              <span className={styles.name}>{c.name}</span>
              <span className={styles.email}>{c.email}</span>
              <span className={styles.subject}>{c.subject}</span>
              <span className={styles.date}>
                {new Date(c.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <select
                value={c.status}
                onChange={(e) => handleStatusChange(c.id, e.target.value as Status)}
                className={styles.status}
                style={{ color: STATUS_COLORS[c.status] }}
              >
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
