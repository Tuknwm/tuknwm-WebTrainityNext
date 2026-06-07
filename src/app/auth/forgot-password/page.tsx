"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Section from "@/components/sections";
import authStyles from "@/styles/kaming/auth.module.css";

export default function ForgotPasswordPage() {
  return (
    <Section>
      <div className={authStyles.loginContainer}>
        <div className={authStyles.loginForm}>
          <h1 className={authStyles.loginTitle}>Lupa Password</h1>

          {/* ── Disabled notice ── */}
          <div
            style={{
              background: "rgba(107,114,128,0.18)",
              border: "1px solid rgba(107,114,128,0.45)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📧</div>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
              Fitur ini memerlukan <strong style={{ color: "#6b7280" }}>layanan email server</strong>.
              <br />
              Tidak tersedia dalam mode demo (tanpa backend).
            </p>
          </div>

          {/* ── Grayed-out form ── */}
          <div style={{ opacity: 0.4, pointerEvents: "none", userSelect: "none" }}>
            <div className={authStyles.formInputsContainer}>
              <div>
                <label htmlFor="email" className={authStyles.formLabel}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={authStyles.loginInput}
                  placeholder="email@anda.com"
                  disabled
                />
              </div>
            </div>
            <button type="button" className={authStyles.loginSubmitButton} disabled>
              Kirim Kode
            </button>
          </div>

          <div className={authStyles.loginRedirectText}>
            <Link href="/auth/login" className={authStyles.loginRedirectLink}>
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
