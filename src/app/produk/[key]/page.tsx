"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Section from "@/components/sections";
import Link from "next/link";
import Image from "next/image";
import ReviewForm from "@/components/michael/reviewForm";
import { useSession } from "@/lib/mockAuth";
import { getProductByName, getReviewsByProductName, isProductOwned, type MockProduct, type MockReview } from "@/lib/mockStore";

import styles from "@/styles/kaming/publicProdukDetail.module.css";
import reviewStyles from "@/styles/michael/reviewUser.module.css";

export default function DetailProdukPage() {
  const { data: session, status: authStatus } = useSession();
  const isLoggedIn = authStatus === "authenticated";

  const params = useParams();
  const productKey = params.key as string;

  const [product, setProduct] = useState<MockProduct | null>(null);
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(() => {
    const r = getReviewsByProductName(decodeURIComponent(productKey));
    setReviews([...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [productKey]);

  useEffect(() => {
    if (authStatus === "loading") return;
    const prod = getProductByName(decodeURIComponent(productKey));
    setProduct(prod ?? null);
    if (prod && session?.user?.id) {
      setOwned(isProductOwned(session.user.id, prod._id));
    }
    loadReviews();
    setLoading(false);
  }, [productKey, authStatus, session, loadReviews]);

  const getActionButton = () => {
    if (!isLoggedIn) {
      return (
        <Link href="/auth/login" passHref>
          <button className={styles.actionButton_secondary}>Login untuk Beli</button>
        </Link>
      );
    }
    if (owned && product) {
      return (
        <Link href={`/user/belajar/${product.name}`} passHref>
          <button className={styles.actionButton_owned}>Mulai Belajar</button>
        </Link>
      );
    }
    return (
      <Link href={`/user/pembelian/checkout/${productKey}`} passHref>
        <button className={styles.actionButton_primary}>Beli Sekarang</button>
      </Link>
    );
  };

  if (loading || authStatus === "loading") {
    return <Section><div>Memuat detail produk...</div></Section>;
  }

  if (!product) {
    return <Section><div>Produk tidak ditemukan.</div></Section>;
  }

  return (
    <Section className={styles.space}>
      <div className={styles.detailGrid}>
        <div className={styles.imageWrapper}>
          <Image
            src={`https://i.ytimg.com/vi/${product.kodePelajaranPertama}/hq720.jpg`}
            alt={product.name}
            width={720}
            height={404}
            layout="responsive"
            className={styles.productImage}
          />
        </div>

        <div className={styles.detailsWrapper}>
          <div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productDescription}>{product.desc}</p>
          </div>
          <div className={styles.actionBox}>
            <span className={styles.productPrice}>Gratis</span>
            <div className={styles.actionButtonContainer}>{getActionButton()}</div>
          </div>
        </div>
      </div>

      <div className={reviewStyles.reviewContainer}>
        <div className={reviewStyles.reviewHistory}>
          <h2 className={reviewStyles.historyTitle}>Review dari Pengguna</h2>
          {reviews.length === 0 ? (
            <div className={reviewStyles.emptyState}>
              <p>Belum ada review untuk produk ini</p>
            </div>
          ) : (
            <div className={reviewStyles.reviewsList}>
              {reviews.map((review) => (
                <div key={review._id} className={reviewStyles.reviewItem}>
                  <div className={reviewStyles.reviewHeader}>
                    <div className={reviewStyles.userAvatar}>
                      <span>{review.userName.charAt(0)}</span>
                    </div>
                    <div className={reviewStyles.userInfo}>
                      <h4 className={reviewStyles.reviewUserName}>{review.userName}</h4>
                      <div className={reviewStyles.reviewRating}>
                        <span className={reviewStyles.stars}>{"⭐".repeat(review.rating)}</span>
                        <span className={reviewStyles.ratingText}>({review.rating}/5)</span>
                      </div>
                    </div>
                    <span className={reviewStyles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={reviewStyles.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <ReviewForm productKey={productKey} onSuccess={loadReviews} />
      </div>
    </Section>
  );
}
