"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/kaming/backbutton";
import Section from "@/components/sections";
import { signIn, useMockAuth } from "@/lib/mockAuth";
import styles from "@/styles/kaming/auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const { update } = useMockAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res.error) {
      setError(res.error);
    } else {
      // Read session that signIn just wrote to localStorage
      const raw = localStorage.getItem("trainity_session");
      if (raw) {
        const session = JSON.parse(raw);
        update(session.user);
        setSuccess("Login berhasil! Mengalihkan...");
        await new Promise((r) => setTimeout(r, 800));
        router.push(session.user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      }
    }
  };

  return (
    <Section>
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <BackButton />
          <h2 className={styles.loginTitle}>Sign In</h2>

          <div
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "12px",
              fontSize: "12px",
              color: "#a5b4fc",
              lineHeight: 1.6,
            }}
          >
            <strong>Demo:</strong> admin@trainity.com / password123
            <br />
            <strong>User:</strong> demo@trainity.com / password123
          </div>

          <div className={styles.formInputsContainer}>
            <div>
              <label htmlFor="email" className={styles.formLabel}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className={styles.loginInput}
              />
            </div>

            <div className={styles.passwordWrapper}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className={styles.loginInput}
              />
              <i
                className={`bx ${showPassword ? "bx-hide" : "bx-show"} ${styles.passwordIcon}`}
                onClick={() => setShowPassword((prev) => !prev)}
              />
              <div className={styles.textRight}>
                <Link href="/auth/forgot-password" className={styles.linkSubtle}>
                  Lupa Password?
                </Link>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.loginSubmitButton}>Masuk</button>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <p className={styles.loginRedirectText}>
            Belum punya akun?{" "}
            <a href="/auth/register" className={styles.loginRedirectLink}>Daftar di sini</a>
          </p>
        </form>
      </div>
    </Section>
  );
}
