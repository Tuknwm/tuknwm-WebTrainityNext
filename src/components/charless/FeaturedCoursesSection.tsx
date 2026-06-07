"use client";

import React from "react";
import styles from "@/styles/charless/featuredcourse.module.css";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/mockStore";

const FeaturedCourses = () => {
  // Show all available courses (up to 3) from mock store
  const courses = getProducts().slice(0, 3);

  return (
    <section id="kursus" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Kursus Unggulan</h2>
        </div>

        <div className={styles.grid}>
          {courses.map((course) => (
            <Link key={course._id} href={`/produk/${course.name}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={`https://i.ytimg.com/vi/${course.kodePelajaranPertama}/hq720.jpg`}
                  alt={course.name}
                  className={styles.thumbnail}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.imageOverlay}></div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{course.name}</h3>
                <p className={styles.cardDescription}>{course.shortDesc}</p>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            Tidak ada kursus unggulan yang tersedia.
          </p>
        )}

        <div className={styles.buttonWrapper}>
          <Link href="/produk" className={styles.viewAllButton}>
            Lihat Semua Kursus
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
