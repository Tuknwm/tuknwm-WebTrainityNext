"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Section from "@/components/sections";
import Image from "next/image";
import { useSession } from "@/lib/mockAuth";
import { getOwnedByUser, getProducts, getProgress } from "@/lib/mockStore";
import styles from "@/styles/kaming/owned.module.css";

interface OwnedCourse {
  productId: string;
  name: string;
  kodePertama: string | null;
  progressPercentage: number;
}

export default function OwnedProductPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<OwnedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setLoading(false);
      return;
    }
    const userId = session.user.id;
    const owned = getOwnedByUser(userId);
    const products = getProducts();
    const result: OwnedCourse[] = owned.map((up) => {
      const prod = products.find((p) => p._id === up.productId);
      return {
        productId: up.productId,
        name: prod?.name ?? "",
        kodePertama: prod?.video?.[0]?.kodePelajaran ?? null,
        progressPercentage: getProgress(userId, up.productId),
      };
    });
    setCourses(result);
    setLoading(false);
  }, [status, session]);

  if (loading) {
    return <Section><div className={styles.ownedPage_empty}>Memuat kursus kamu...</div></Section>;
  }

  if (status === "unauthenticated") {
    return (
      <Section>
        <div className={styles.ownedPage_empty}>
          <p>Anda belum login.</p>
          <a href="/auth/login" style={{ color: "#6366f1" }}>Login di sini</a>
        </div>
      </Section>
    );
  }

  if (courses.length === 0) {
    return (
      <Section>
        <div className={styles.ownedPage_empty}>
          Kamu belum memiliki kursus apapun.{" "}
          <Link href="/produk" style={{ color: "#6366f1" }}>Cek kursus tersedia</Link>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className={styles.ownedPage_container}>
        <h1 className={styles.ownedPage_title}>Kursus yang Kamu Miliki</h1>
        <div className={styles.ownedPage_grid}>
          {courses.map((course) => (
            <div key={course.name} className={styles.card}>
              {course.kodePertama && (
                <Image
                  height={400}
                  width={400}
                  src={`https://i.ytimg.com/vi/${course.kodePertama}/hqdefault.jpg`}
                  alt={course.name}
                  className={styles.card_thumbnail}
                />
              )}
              <div className={styles.card_body}>
                <h2 className={styles.card_title}>{course.name}</h2>
                {course.progressPercentage === 100 ? (
                  <p style={{ color: "#28a745", fontWeight: "bold", marginBottom: "10px" }}>✅ Kursus Selesai!</p>
                ) : course.progressPercentage > 0 ? (
                  <p style={{ color: "#ffc107", fontWeight: "bold", marginBottom: "10px" }}>⏳ Sedang Dipelajari</p>
                ) : (
                  <p style={{ color: "#6c757d", marginBottom: "10px" }}>💡 Belum Dimulai</p>
                )}
                <div className={styles.progress_container}>
                  <div className={styles.progress_bar} style={{ width: `${course.progressPercentage}%` }} />
                </div>
                <p className={styles.progressText}>{course.progressPercentage}% selesai</p>
                <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
                  <Link href={`/user/belajar/${course.name}`} className={styles.card_button}>
                    {course.progressPercentage === 100 ? "Lihat Detail" : course.progressPercentage > 0 ? "Lanjut Belajar" : "Mulai Belajar"}
                  </Link>
                  {course.progressPercentage === 100 && (
                    <Link href={`/user/sertifikat/${course.name}`} className={styles.card_button}>
                      Lihat Sertifikat
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
