"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiAuthGet, apiAuthPost, apiAuthPatch, apiAuthDelete } from "@/lib/api";
import styles from "./page.module.scss";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number;
  order: number;
  iconUrl: string | null;
}

export default function ServicesPage() {
  const { accessToken } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", order: "", iconUrl: "" });

  useEffect(() => {
    if (!accessToken) return;
    apiAuthGet<Service[]>("/api/admin/services", accessToken)
      .then(setServices)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  function openCreate() {
    setEditingId(null);
    setForm({ title: "", description: "", price: "", order: "", iconUrl: "" });
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      title:       s.title,
      description: s.description ?? "",
      price:       s.price.toString(),
      order:       s.order.toString(),
      iconUrl:     s.iconUrl ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    const body = {
      title:       form.title,
      price:       parseFloat(form.price),
      description: form.description || undefined,
      iconUrl:     form.iconUrl || undefined,
      order:       form.order ? parseInt(form.order) : undefined,
    };
    try {
      if (editingId) {
        const updated = await apiAuthPatch<Service>(`/api/admin/services/${editingId}`, accessToken, body);
        setServices((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...updated } : s)));
      } else {
        const created = await apiAuthPost<Service>("/api/admin/services", accessToken, body);
        setServices((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      }
      setShowForm(false);
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    if (!confirm("Supprimer ce service ?")) return;
    try {
      await apiAuthDelete(`/api/admin/services/${id}`, accessToken);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>← Dashboard</Link>
          <h1>Services</h1>
        </div>
        <button className={styles.btnCreate} onClick={openCreate}>+ Nouveau service</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>{editingId ? "Modifier le service" : "Nouveau service"}</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Titre *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label>Prix (€) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" />
            </div>
            <div className={styles.field}>
              <label>Ordre d'affichage</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="1" min="0" />
            </div>
            <div className={styles.field}>
              <label>URL de l'icône</label>
              <input value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnSave}>Sauvegarder</button>
            <button type="button" className={styles.btnCancel} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className={styles.loading}>Chargement...</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.thead}>
            <span>#</span>
            <span>Titre</span>
            <span>Description</span>
            <span>Prix</span>
            <span>Actions</span>
          </div>
          {services.map((s) => (
            <div key={s.id} className={styles.row}>
              <span className={styles.order}>{s.order}</span>
              <span className={styles.title}>{s.title}</span>
              <span className={styles.desc}>{s.description ?? "—"}</span>
              <span className={styles.price}>{s.price.toLocaleString("fr-FR")} €</span>
              <div className={styles.actions}>
                <button className={styles.btnEdit} onClick={() => openEdit(s)}>Modifier</button>
                <button className={styles.btnDelete} onClick={() => handleDelete(s.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}