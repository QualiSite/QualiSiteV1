"use client";
import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiAuthGet, apiAuthPost, apiAuthPatch, apiAuthDelete } from "@/lib/api";
import styles from "./page.module.scss";
import Image from "next/image";

interface ProjectImage {
  imageId: string;
  isCover: boolean;
  image: { imageUrl: string; altText: string | null };
}

interface Project {
  id: string;
  title: string;
  summary: string | null;
  year: number | null;
  isPublished: boolean;
  images: ProjectImage[];
}

export default function ProjectsPage() {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", summary: "", year: "" });
  const [openImagesId, setOpenImagesId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    apiAuthGet<Project[]>("/api/admin/projects", accessToken)
      .then(setProjects)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  function openCreate() {
    setEditingId(null);
    setForm({ title: "", summary: "", year: "" });
    setPendingFiles([]); // ← reset les fichiers en attente
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({ title: p.title, summary: p.summary ?? "", year: p.year?.toString() ?? "" });
    setPendingFiles([]);
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
        const updated = await apiAuthPatch<Project>(
          `/api/admin/projects/${editingId}`,
          accessToken,
          body
        );
        setProjects((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p)));
        setShowForm(false);
      } else {
        // 1. Créer le projet
        const created = await apiAuthPost<Project>("/api/admin/projects", accessToken, body);
        const images: ProjectImage[] = [];

        // 2. Uploader les images sélectionnées une par une
        if (pendingFiles.length > 0) {
          setUploading(true);
          const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
          for (const file of pendingFiles) {
            const formData = new FormData();
            formData.append("image", file);
            const res = await fetch(`${API}/api/admin/projects/${created.id}/images`, {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}` },
              body: formData,
            });
            if (res.ok) {
              const newImage = await res.json();
              images.push({
                imageId: newImage.id,
                isCover: newImage.isCover,
                image: { imageUrl: newImage.imageUrl, altText: newImage.altText },
              });
            }
          }
          setUploading(false);
          setPendingFiles([]);
        }

        // 3. Ajouter le projet avec ses images dans le state
        setProjects((prev) => [{ ...created, images }, ...prev]);
        setShowForm(false);
      }
    } catch {
      alert("Erreur lors de la sauvegarde");
      setUploading(false);
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

  async function handleUploadImage(projectId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${API}/api/admin/projects/${projectId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const newImage = await res.json();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                images: [
                  ...p.images,
                  {
                    imageId: newImage.id,
                    isCover: newImage.isCover,
                    image: { imageUrl: newImage.imageUrl, altText: newImage.altText },
                  },
                ],
              }
            : p
        )
      );
      e.target.value = "";
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSetCover(projectId: string, imageId: string) {
    if (!accessToken) return;
    try {
      await apiAuthPatch(
        `/api/admin/projects/${projectId}/images/${imageId}/cover`,
        accessToken,
        {}
      );
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                images: p.images.map((img) => ({ ...img, isCover: img.imageId === imageId })),
              }
            : p
        )
      );
    } catch {
      alert("Erreur");
    }
  }

  async function handleDeleteImage(projectId: string, imageId: string) {
    if (!accessToken) return;
    if (!confirm("Supprimer cette image ?")) return;
    try {
      await apiAuthDelete(`/api/admin/projects/${projectId}/images/${imageId}`, accessToken);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, images: p.images.filter((img) => img.imageId !== imageId) }
            : p
        )
      );
    } catch {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>
            ← Dashboard
          </Link>
          <h1>Projets</h1>
        </div>
        <button className={styles.btnCreate} onClick={openCreate}>
          + Nouveau projet
        </button>
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
            {/* Champ images uniquement à la création */}
            {!editingId && (
              <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                <label>Images</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setPendingFiles(Array.from(e.target.files ?? []))}
                />
                {pendingFiles.length > 0 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {pendingFiles.length} fichier(s) sélectionné(s)
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnSave} disabled={uploading}>
              {uploading ? "Upload en cours..." : "Sauvegarder"}
            </button>
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
            <Fragment key={p.id}>
              <div className={styles.row}>
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
                  <button
                    className={styles.btnImages}
                    onClick={() => setOpenImagesId(openImagesId === p.id ? null : p.id)}
                  >
                    🖼 {p.images.length}
                  </button>
                  <button className={styles.btnEdit} onClick={() => openEdit(p)}>
                    Modifier
                  </button>
                  <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>
                    Supprimer
                  </button>
                </div>
              </div>

              {openImagesId === p.id && (
                <div className={styles.imagePanel}>
                  <div className={styles.imagePanelGrid}>
                    {p.images.map((img) => (
                      <div key={img.imageId} className={styles.imageCard}>
                        <Image
                          src={img.image.imageUrl}
                          alt={img.image.altText ?? ""}
                          width={200}
                          height={150}
                        />
                        {img.isCover && <span className={styles.coverBadge}>Couverture</span>}
                        <div className={styles.imageActions}>
                          {!img.isCover && (
                            <button onClick={() => handleSetCover(p.id, img.imageId)}>
                              Définir couverture
                            </button>
                          )}
                          <button
                            className={styles.imgDelete}
                            onClick={() => handleDeleteImage(p.id, img.imageId)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className={styles.uploadZone}>
                      {uploading ? "Upload..." : "+ Ajouter une image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(p.id, e)}
                        hidden
                      />
                    </label>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
