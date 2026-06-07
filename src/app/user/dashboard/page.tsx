"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import InProgressCourseCard from "@/components/fabio/InProgressCourseCard";
import RecommendedCourseCard from "@/components/fabio/RecommendedCourseCard";
import NoCourseCard from "@/components/fabio/NoCourseCard";
import Section from "@/components/sections";
import Link from "next/link";
import { useSession } from "@/lib/mockAuth";
import { getOwnedByUser, getProducts, getProgress } from "@/lib/mockStore";
import styles from "@/styles/fabio/UserDashboard.module.css";

interface CourseCard {
  id: string;
  name: string;
  shortDesc: string;
  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  status: string;
  lastWatchedVideoId?: string | null;
  kodePertama?: string;
}

function thumbUrl(kodePelajaran?: string) {
  return kodePelajaran
    ? `https://i.ytimg.com/vi/${kodePelajaran}/hqdefault.jpg`
    : "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=No+Image";
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [inProgressCourses, setInProgressCourses] = useState<CourseCard[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    const owned = getOwnedByUser(userId);
    const allProducts = getProducts();

    const ownedProductIds = new Set(owned.map((up) => up.productId));

    const inProgress: CourseCard[] = owned.map((up) => {
      const prod = allProducts.find((p) => p._id === up.productId);
      const progress = getProgress(userId, up.productId);
      return {
        id: up.productId,
        name: prod?.name ?? "",
        shortDesc: prod?.shortDesc ?? "",
        title: prod?.name ?? "",
        category: prod?.name ?? "",
        imageUrl: thumbUrl(prod?.video?.[0]?.kodePelajaran),
        progress,
        status: progress === 100 ? "selesai" : progress > 0 ? "aktif" : "aktif",
        lastWatchedVideoId: up.lastWatchedVideoId,
        kodePertama: prod?.video?.[0]?.kodePelajaran,
      };
    });

    const recommended: CourseCard[] = allProducts
      .filter((p) => !ownedProductIds.has(p._id))
      .map((p) => ({
        id: p._id,
        name: p.name,
        shortDesc: p.shortDesc,
        title: p.name,
        category: p.name,
        imageUrl: thumbUrl(p.video?.[0]?.kodePelajaran),
        progress: 0,
        status: "aktif",
      }));

    setInProgressCourses(inProgress);
    setRecommendedCourses(recommended);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    loadData();
  }, [status, loadData]);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % recommendedCourses.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + recommendedCourses.length) % recommendedCourses.length);
  const goToSlide = (i: number) => setCurrentSlide(i);

  if (status === "loading" || loading) {
    return <div className={styles.loadingContainer}>Memuat dashboard...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.loadingContainer}>
        <p>Anda belum login.</p>
        <a href="/auth/login" style={{ color: "#6366f1" }}>Login di sini</a>
      </div>
    );
  }

  const currentCourse = recommendedCourses[currentSlide];

  return (
    <Section>
      <div className={styles.welcomeCard}>
        <h1 className={styles.welcomeTitle}>
          Selamat datang, <span className={styles.userName}>{session?.user?.name ?? "User"}!</span>
        </h1>
        <p className={styles.welcomeSubtitle}>Teruskan progres Anda dan capai tujuan belajar Anda.</p>
      </div>

      <div className={styles.quickActions}>
        <div className={styles.actionCard} onClick={() => router.push("/user/profile")}>
          <div className={styles.actionIcon}>👤</div>
          <h3 className={styles.actionTitle}>Profil Saya</h3>
          <p className={styles.actionDescription}>Kelola data pribadi dan pengaturan akun</p>
        </div>
        <div className={styles.actionCard} onClick={() => router.push("/user/belajar")}>
          <div className={styles.actionIcon}>📚</div>
          <h3 className={styles.actionTitle}>Halaman Belajar</h3>
          <p className={styles.actionDescription}>Akses materi dan lanjutkan pembelajaran</p>
        </div>
        <div className={styles.actionCard} onClick={() => router.push("/produk")}>
          <div className={styles.actionIcon}>🛍️</div>
          <h3 className={styles.actionTitle}>Produk &amp; Kursus</h3>
          <p className={styles.actionDescription}>Jelajahi kursus dan produk lainnya</p>
        </div>
      </div>

      <div className={styles.equalGrid}>
        <div className={styles.equalCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Kursus Sedang Berjalan</h2>
            <Link href="/user/belajar" style={{ textDecoration: "none" }}>
              <p className={styles.linkButton}>Belajar Semua</p>
            </Link>
          </div>
          <div className={styles.coursesList}>
            {inProgressCourses.length > 0 ? (
              inProgressCourses.map((course) => (
                <InProgressCourseCard key={course.id} course={course} router={router} />
              ))
            ) : (
              <NoCourseCard router={router} />
            )}
          </div>
        </div>

        <div className={styles.equalCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Rekomendasi Untuk Anda</h2>
          </div>
          <div className={styles.recommendedCarousel}>
            {recommendedCourses.length > 0 && currentCourse ? (
              <>
                <div className={styles.carouselSlide}>
                  <RecommendedCourseCard
                    course={{ id: 0, title: currentCourse.title, category: currentCourse.category, imageUrl: currentCourse.imageUrl }}
                    router={router}
                  />
                </div>
                <div className={styles.carouselControls}>
                  <button onClick={prevSlide} className={styles.carouselButton}>‹</button>
                  <div className={styles.carouselDots}>
                    {recommendedCourses.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`${styles.carouselDot} ${currentSlide === i ? styles.active : ""}`}
                      />
                    ))}
                  </div>
                  <button onClick={nextSlide} className={styles.carouselButton}>›</button>
                </div>
              </>
            ) : (
              <div className={styles.noRecommendation}>
                <p>Semua kursus sudah kamu miliki!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
