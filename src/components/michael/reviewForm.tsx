"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/mockAuth";
import { addReview, getProductByName } from "@/lib/mockStore";
import styles from "@/styles/michael/reviewUser.module.css";

interface ReviewFormProps {
  productKey: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productKey, onSuccess }: ReviewFormProps) {
  const { data: session, status: authStatus } = useSession();
  const isLoggedIn = authStatus === "authenticated";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isLoggedIn || !session?.user) {
      setErrorMessage("Silakan login terlebih dahulu untuk memberikan review");
      return;
    }
    if (rating === 0) { setErrorMessage("Silakan berikan rating bintang"); return; }
    if (comment.trim() === "") { setErrorMessage("Silakan tulis komentar review"); return; }

    setIsSubmitting(true);

    const product = getProductByName(decodeURIComponent(productKey));
    if (!product) {
      setErrorMessage("Produk tidak ditemukan");
      setIsSubmitting(false);
      return;
    }

    addReview({
      userId: session.user.id,
      userName: session.user.username,
      productId: product._id,
      productName: product.name,
      rating,
      comment,
    });

    setRating(0);
    setComment("");
    setIsSubmitting(false);
    setSubmitted(true);
    onSuccess?.();
  };

  if (authStatus === "loading") return <div>Loading...</div>;

  return (
    <div className={styles.reviewSection}>
      <h2 className={styles.reviewTitle}>Berikan Review</h2>

      {!isLoggedIn ? (
        <div className={styles.loginPrompt}>
          <p>Silakan login untuk memberikan review</p>
          <Link href="/auth/login" className={styles.loginLink}>Login Sekarang</Link>
        </div>
      ) : submitted ? (
        <div className={styles.successMessage}>
          <p>Terima kasih! Review Anda telah berhasil dikirim.</p>
          <button
            onClick={() => setSubmitted(false)}
            style={{ marginTop: "8px", background: "none", border: "none", color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}
          >
            Tulis review lagi
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <div className={styles.ratingSection}>
            <label className={styles.ratingLabel}>Rating:</label>
            <div className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${star <= rating ? styles.starActive : styles.starInactive}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <span className={styles.ratingText}>{rating > 0 ? `${rating} bintang` : "Pilih rating"}</span>
          </div>

          <div className={styles.commentSection}>
            <div className={styles.commentHeader}>
              <label htmlFor="comment" className={styles.commentLabel}>Komentar:</label>
              <span className={styles.charCount}>{comment.length}/128</span>
            </div>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => { if (e.target.value.length <= 128) setComment(e.target.value); }}
              placeholder="Tulis komentar singkat Anda... (maks. 128 karakter)"
              className={styles.commentTextarea}
              rows={3}
              maxLength={128}
              required
            />
          </div>

          {errorMessage && <div className={styles.errorMessage}><p>{errorMessage}</p></div>}

          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim() === ""}
            className={styles.submitButton}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Review"}
          </button>
        </form>
      )}
    </div>
  );
}
