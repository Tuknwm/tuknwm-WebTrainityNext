"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/sections";
import { useSession, useMockAuth } from "@/lib/mockAuth";
import { updateUser } from "@/lib/mockStore";
import styles from "@/styles/fabio/EditProfile.module.css";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { update } = useMockAuth();

  const [formData, setFormData] = useState({ username: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (session?.user) {
      setFormData({ username: session.user.username, email: session.user.email });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = updateUser(session.user.id, formData);
      update({ ...session.user, username: updated.username, name: updated.username, email: updated.email });
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    } catch {
      setMessage({ type: "error", text: "Gagal memperbarui profil" });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <Section><div className={styles.loadingContainer}>Memuat profil...</div></Section>;
  }

  if (status === "unauthenticated") {
    return (
      <Section>
        <div className={styles.loadingContainer}>
          <p>Anda belum login.</p>
          <a href="/auth/login" style={{ color: "#6366f1" }}>Login di sini</a>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className={styles.profileHeader}>
        <h1 className={styles.title}>Edit Profil</h1>
        <p className={styles.subtitle}>Kelola informasi profil Anda</p>
      </div>

      <div className={styles.profileContainer}>
        <div className={styles.formSection}>
          <button className={styles.backButton} onClick={() => router.push("/user/dashboard")}>
            <span className={styles.backIcon}>←</span>
            Kembali ke Dashboard
          </button>

          {message.text && (
            <div className={message.type === "success" ? styles.successMessage : styles.errorMessage}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                placeholder="Masukkan username"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="Masukkan email"
                required
              />
              <p className={styles.forgotPassword}>
                Kamu lupa password?{" "}
                <span onClick={() => router.push("/auth/forgot-password")} className={styles.forgotLink}>
                  klik disini!
                </span>
              </p>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" onClick={() => router.push("/user/dashboard")} className={styles.cancelButton}>
                Batal
              </button>
              <button type="submit" disabled={isLoading} className={styles.saveButton}>
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
}
