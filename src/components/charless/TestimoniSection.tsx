"use client";

import React from "react";
import styles from "@/styles/charless/testimoni.module.css";
import { getReviews } from "@/lib/mockStore";

const StarRating = ({ rating }: { rating: number }) => {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return <span style={{ color: "#FFD700" }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
};

const TestimonialsSection = () => {
  const allReviews = getReviews();

  // Prefer rating >= 4 with longer comment, fallback to any rating >= 4
  let reviews = allReviews.filter((r) => r.rating >= 4 && r.comment.length >= 50).slice(0, 5);
  if (reviews.length === 0) reviews = allReviews.filter((r) => r.rating >= 4).slice(0, 5);
  if (reviews.length === 0) reviews = allReviews.slice(0, 5);

  if (reviews.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <p style={{ textAlign: "center", padding: "2rem" }}>Belum ada testimoni.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Apa Kata Mereka Tentang Trainity</h2>
          <p className={styles.subtitle}>Dengarkan pengalaman nyata dari para pengguna.</p>
        </div>

        <div
          className={styles.slider}
          style={{ "--width": "420px", "--height": "320px", "--quantity": reviews.length } as React.CSSProperties}
        >
          <div className={styles.list}>
            {reviews.map((review, index) => (
              <div
                key={review._id}
                className={styles.item}
                style={{ "--position": index + 1 } as React.CSSProperties}
              >
                <div className={styles.testimonialCard}>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{review.userName}</h3>
                    <p className={styles.userInstitution}>
                      <StarRating rating={review.rating} />
                    </p>
                  </div>
                  <p className={styles.quote}>&ldquo;{review.comment}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
