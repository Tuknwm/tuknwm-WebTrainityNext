"use client";

import { useState, useEffect } from "react";
import Section from "@/components/sections";
import Link from "next/link";
import { useSession } from "@/lib/mockAuth";
import { getAdminDashboard } from "@/lib/mockStore";
import styles from "@/styles/michael/dashboard.module.css";

interface Activity {
  userName: string;
  purchasedAt: string;
  productName: string;
}

interface Review {
  productName: string;
  rating: number;
  comment: string;
  userName: string;
  reviewedAt: string;
}

interface DashboardData {
  latestUserActivity: Activity[];
  latestReviews: Review[];
}

export default function AdminDashboard() {
  const { status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    setDashboardData(getAdminDashboard());
  }, [status]);

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.errorText}>Anda belum login.</p>
        <Link href="/auth/login" style={{ color: "#6366f1" }}>Login di sini</Link>
      </div>
    );
  }

  return (
    <Section>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Overview aktivitas dan review pengguna</p>
      </div>

      <div className={styles.quickActions}>
        <Link href="/admin/review" className={styles.actionButton}>
          <span className={styles.actionIcon}>📝</span>Kelola Review
        </Link>
        <Link href="/admin/produk" className={styles.actionButton}>
          <span className={styles.actionIcon}>📦</span>Kelola Produk
        </Link>
        <Link href="/admin/pembelian" className={styles.actionButton}>
          <span className={styles.actionIcon}>💳</span>Riwayat Pembelian
        </Link>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrapper}>
              <h2 className={styles.cardTitle}>Aktivitas User Terbaru</h2>
              <span className={styles.cardCount}>{dashboardData?.latestUserActivity.length ?? 0} aktivitas</span>
            </div>
            <Link href="/admin/pembelian" className={styles.nextLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.activityList}>
            {dashboardData?.latestUserActivity.length === 0 && (
              <p style={{ color: "#9ca3af", padding: "12px 0" }}>Belum ada aktivitas.</p>
            )}
            {dashboardData?.latestUserActivity.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityUser}>
                  <div className={styles.userAvatar}>{activity.userName.charAt(0)}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{activity.userName}</span>
                    <span className={styles.productName}>{activity.productName}</span>
                  </div>
                </div>
                <div className={styles.activityTime}>
                  {new Date(activity.purchasedAt).toLocaleDateString("id-ID")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrapper}>
              <h2 className={styles.cardTitle}>Review Terbaru</h2>
              <span className={styles.cardCount}>{dashboardData?.latestReviews.length ?? 0} review</span>
            </div>
            <Link href="/admin/review" className={styles.nextLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.reviewList}>
            {dashboardData?.latestReviews.length === 0 && (
              <p style={{ color: "#9ca3af", padding: "12px 0" }}>Belum ada review.</p>
            )}
            {dashboardData?.latestReviews.map((review, index) => (
              <div key={index} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <div className={styles.userAvatar}>{review.userName.charAt(0)}</div>
                    <div>
                      <span className={styles.userName}>{review.userName}</span>
                      <div className={styles.rating}>
                        {"⭐".repeat(review.rating)}
                        <span className={styles.ratingText}>({review.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                  <span className={styles.reviewTime}>
                    {new Date(review.reviewedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
                <span className={styles.productName}>{review.productName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
