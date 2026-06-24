"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiAuthGet, apiAuthPost, apiAuthPatch, apiAuthDelete } from "@/lib/api";
import styles from "./page.module.scss";

interface Project {
  id: string;
  title: string;
  summary: string | null;
  year: number | null;
  isPublished: boolean;
}

export default function ProjectsPage() {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", summary: "", year: "" });

  useEffect(() => {
    if (!accessToken) return;
    apiAuthGet<Project[]>("/api/admin/projects", accessToken)
      .then(setProjects)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  function openCreate() {
    setEditingId(null);
    setForm({ title: "", summary: "", year: "" });
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({ title: p.title, summary: p.summary ?? "", year: p.year?.toString() ?? "" });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    const body = {
      title: form.title,
      summary: form.summary || undefined,
      year: form.year ? parseInt(form.year) : undefined,
    };
    try {
      if (editingId) {
        const updated = await apiAuthPatch<Project>(`/api/admin/projects/${editingId}`, accessToken, body);
        setProjects((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p)));
      } else {
        const created = await apiAuthPost<Project>("/api/admin/projects", accessToken, body);
        setProjects((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  }

  async function handleTogglePublish(id: string) {
    if (!accessToken) return;
    try {
      const res = await apiAuthPatch<{ isPublished: boolean }>(
        `/api/admin/projects/${id}/publish`,
        accessToken,
        {}
      );
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublished: res.isPublished } : p))
      );
    } catch {
      alert("Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    if (!confirm("Supprimer ce projet ?")) return;
    try {
      await apiAuthDelete(`/api/admin/projects/${id}`, accessToken);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>← Dashboard</Link>
          <h1>Projets</h1>
        </div>
        <button className={styles.btnCreate} onClick={openCreate}>+ Nouveau projet</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>{editingId ? "Modifier le projet" : "Nouveau projet"}</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Titre *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Année</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2025"
              />
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>Résumé</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnSave}>Sauvegarder</button>
            <button type="button" className={styles.btnCancel} onClick={() => setShowForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Titre</span>
            <span>Année</span>
            <span>Résumé</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>
          {projects.map((p) => (
            <div key={p.id} className={styles.row}>
              <span className={styles.title}>{p.title}</span>
              <span className={styles.year}>{p.year ?? "—"}</span>
              <span className={styles.summary}>{p.summary ?? "—"}</span>
              <button
                className={`${styles.badge} ${p.isPublished ? styles.published : styles.draft}`}
                onClick={() => handleTogglePublish(p.id)}
              >
                {p.isPublished ? "Publié" : "Brouillon"}
              </button>
              <div className={styles.actions}>
                <button className={styles.btnEdit} onClick={() => openEdit(p)}>Modifier</button>
                <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}