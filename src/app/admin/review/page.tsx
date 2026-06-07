"use client";

import Section from "@/components/sections";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/mockAuth";
import { getReviews, deleteReview, type MockReview } from "@/lib/mockStore";
import styles from "@/styles/michael/reviewAdmin.module.css";

const ITEMS_PER_PAGE = 10;

export default function AdminReview() {
  const { status } = useSession();
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<MockReview | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadReviews = useCallback(() => {
    setReviews(getReviews());
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    loadReviews();
  }, [status, loadReviews]);

  const totalItems = reviews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const paginated = reviews
    .slice()
    .reverse()
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleDelete = () => {
    if (!reviewToDelete) return;
    deleteReview(reviewToDelete._id);
    loadReviews();
    setShowDeleteModal(false);
    setReviewToDelete(null);
    setShowSuccessModal(true);
  };

  if (status === "loading") {
    return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Loading...</p></div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.errorText}>Anda belum login.</p>
        <Link href="/auth/login" className={styles.loginLink}>Login di sini</Link>
      </div>
    );
  }

  return (
    <Section>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Review</h1>
        <p className={styles.subtitle}>Kelola review dan rating dari pengguna</p>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionContent}>
          <div>
            <h2 className={styles.actionTitle}>All Review ({totalItems})</h2>
            <p className={styles.actionSubtitle}>
              Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} –{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} dari {totalItems} reviews
            </p>
          </div>
          <div className={styles.actionButtons}>
            <Link href="/admin/dashboard" className={styles.backButton}>← Kembali Ke Dashboard</Link>
            <button onClick={loadReviews} className={styles.backButton}>🔄 Refresh</button>
          </div>
        </div>
      </div>

      <div className={styles.reviewList}>
        {paginated.length === 0 ? (
          <div className={styles.emptyState}><p>Tidak ada review ditemukan</p></div>
        ) : (
          <>
            {paginated.map((review) => (
              <div key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}><span>{review.userName.charAt(0).toUpperCase()}</span></div>
                    <div><h3 className={styles.userName}>{review.userName}</h3></div>
                  </div>
                  <div className={styles.reviewMeta}>
                    <div className={styles.rating}>
                      <span className={styles.stars}>{"⭐".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                      <span className={styles.ratingText}>({review.rating}/5)</span>
                    </div>
                    <span className={`${styles.status} ${styles[review.status]}`}>
                      {review.status === "approved" ? "Disetujui" : review.status === "pending" ? "Menunggu" : review.status}
                    </span>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productLabel}>Produk:</span>
                  <span className={styles.productName}>{review.productName}</span>
                </div>
                <div className={styles.comment}><p>{review.comment}</p></div>
                <div className={styles.reviewFooter}>
                  <div className={styles.date}>
                    Diposting pada{" "}
                    {new Date(review.createdAt).toLocaleDateString("id-ID", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })}
                  </div>
                  <button
                    onClick={() => { setReviewToDelete(review); setShowDeleteModal(true); }}
                    className={styles.deleteButton}
                  >
                    Hapus Review
                  </button>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={styles.paginationButton}>⏮️ First</button>
                <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className={styles.paginationButton}>◀️ Previous</button>
                <div className={styles.pageNumbers}>
                  {getPageNumbers().map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`${styles.pageButton} ${currentPage === p ? styles.activePage : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className={styles.paginationButton}>Next ▶️</button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={styles.paginationButton}>Last ⏭️</button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteModal && reviewToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}><h3 className={styles.modalTitle}>⚠️ Konfirmasi Hapus Review</h3></div>
            <div className={styles.modalBody}>
              <p className={styles.warningText}>Tindakan ini tidak dapat dibatalkan.</p>
              <div className={styles.reviewPreview}>
                <div className={styles.previewHeader}><strong>User:</strong> {reviewToDelete.userName}</div>
                <div className={styles.previewItem}><strong>Rating:</strong> {"⭐".repeat(reviewToDelete.rating)}</div>
                <div className={styles.previewItem}><strong>Komentar:</strong> <p className={styles.previewComment}>&quot;{reviewToDelete.comment}&quot;</p></div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => { setShowDeleteModal(false); setReviewToDelete(null); }} className={styles.cancelButton}>Batal</button>
              <button onClick={handleDelete} className={styles.confirmDeleteButton}>Ya, Hapus Review</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}><h3 className={styles.modalTitleSuccess}>✅ Berhasil</h3></div>
            <div className={styles.modalBody}><p>Review berhasil dihapus!</p></div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowSuccessModal(false)} className={styles.okButton}>Oke</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
