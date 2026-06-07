"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, Loader2, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "@/styles/charless/certificate.module.css";
import { useSession } from "@/lib/mockAuth";
import { useRouter, useParams } from "next/navigation";
import { getProductByName, getOwnedByUser, getProgress } from "@/lib/mockStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CertData {
  userName: string;
  courseName: string;
  completedAt: string;
  progressPercentage: number;
  certificateId: string;
}

export default function ModernCertificate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseKey = decodeURIComponent(params.key as string);

  const certificateRef = useRef<HTMLDivElement>(null);
  const certificatePdfRef = useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [certificate, setCertificate] = useState<CertData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const namaInstruktur = "Fabio";
  const tandaTanganUrl = "/sertifikat/signature.png";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    const product = getProductByName(courseKey);
    if (!product) {
      setError("Kursus tidak ditemukan.");
      setIsFetching(false);
      return;
    }

    const userId = session.user.id;
    const progress = getProgress(userId, product._id);
    if (progress < 100) {
      setError("Anda belum menyelesaikan kursus ini. Selesaikan semua video terlebih dahulu.");
      setIsFetching(false);
      return;
    }

    const ups = getOwnedByUser(userId);
    const up = ups.find((u) => u.productId === product._id);
    setCertificate({
      userName: session.user.username,
      courseName: product.name,
      completedAt: up?.createdAt ?? new Date().toISOString(),
      progressPercentage: 100,
      certificateId: `TRN-${product._id.slice(-4).toUpperCase()}-${userId.slice(-4).toUpperCase()}`,
    });
    setIsFetching(false);
  }, [status, session, courseKey, router]);

  const namaPeserta = certificate?.userName ?? "User";
  const judulKursus = certificate?.courseName ?? "Course";
  const sertifikatId = certificate?.certificateId ?? "TRN-0000";
  const tanggalLulus = certificate?.completedAt
    ? new Date(certificate.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  const handleDownload = async () => {
    if (!certificatePdfRef.current) return;
    setIsLoading(true);
    try {
      const canvas = await html2canvas(certificatePdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#111827",
        width: 1152,
        windowWidth: 1152,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`Sertifikat-${judulKursus.replace(/ /g, "_")}.pdf`);
    } catch (err) {
      alert("Gagal membuat PDF: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignatureError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = "flex";
  };

  const CertificateContent = () => (
    <>
      <div className={styles.bgAnimation}>
        <div className={`${styles.bgCircle} ${styles.circle1}`} style={{ animationDuration: "4s" }} />
        <div className={`${styles.bgCircle} ${styles.circle2}`} style={{ animationDuration: "6s", animationDelay: "1s" }} />
      </div>
      <div className={`${styles.cornerDecorator} ${styles.topLeft}`}><div className={styles.cornerBorder} /></div>
      <div className={`${styles.cornerDecorator} ${styles.bottomRight}`}><div className={styles.cornerBorder} /></div>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoIcon}><Terminal className={styles.iconWhite} /></div>
            <div className={styles.logoText}><h3>TRAINITY</h3><p>Platform Belajar</p></div>
          </div>
          <div className={styles.certIdBadge}>
            <span className={styles.label}>CERTIFICATE ID</span>
            <span className={styles.value}>{sertifikatId}</span>
          </div>
        </div>
        <div className={styles.completionBadgeWrapper}>
          <div className={styles.completionBadge}>
            <CheckCircle2 className={styles.iconBlue} />
            <span>SERTIFKAT KELULUSAN</span>
          </div>
        </div>
        <div className={styles.recipientMain}>
          <p className={styles.recipientLabel}>Sertifikat ini diberikan kepada</p>
          <div className={styles.recipientNameWrapper}>
            <h1 className={styles.recipientName}>{namaPeserta}</h1>
            <div className={styles.nameUnderline} />
          </div>
          <div className={styles.achievementDetails}>
            <p className={styles.text}>telah berhasil menyelesaikan kursus</p>
            <h2 className={styles.courseTitle}>{judulKursus}</h2>
            <div className={styles.courseStats}>
              <div className={styles.statItem}>
                <div className={styles.statDot} />
                <span className={styles.statText}>Selesai: <span className={styles.value}>{tanggalLulus}</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.signatureSection}>
            <div className={styles.signatureImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tandaTanganUrl} alt="Signature" onError={handleSignatureError} />
              <div className={styles.signatureFallback}><div>{namaInstruktur}</div></div>
            </div>
            <div className={styles.signatureUnderline} />
            <div className={styles.signatureInfo}>
              <p className={styles.name}>{namaInstruktur}</p>
              <p className={styles.title}>Instruktur Utama</p>
            </div>
          </div>
        </div>
        <div className={styles.mobileCertId}><span>ID: </span><span>{sertifikatId}</span></div>
      </div>
    </>
  );

  if (isFetching) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loadingWrapper}>
            <Loader2 className={styles.iconLoading} />
            <p>Memuat sertifikat...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !certificate) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.errorWrapper}>
            <AlertCircle className={styles.iconError} />
            <h2>Sertifikat Tidak Tersedia</h2>
            <p>{error ?? "Anda belum menyelesaikan kursus ini."}</p>
            <button onClick={() => router.push("/user/belajar")} className={styles.backButton}>
              Kembali ke Halaman Belajar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div ref={certificateRef} className={styles.card}><CertificateContent /></div>
        <div
          ref={certificatePdfRef}
          className={styles.card}
          style={{ position: "absolute", left: "-9999px", top: 0, width: "1152px", aspectRatio: "16/11" }}
        >
          <CertificateContent />
        </div>
        <div className={styles.downloadButtonContainer}>
          <button onClick={handleDownload} disabled={isLoading} className={styles.downloadButton}>
            <div className={styles.buttonContent}>
              {isLoading ? (
                <><Loader2 className={styles.iconLoading} /><span>Membuat PDF...</span></>
              ) : (
                <><Download className={styles.iconButton} /><span>Unduh Sertifikat</span></>
              )}
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
