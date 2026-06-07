"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/sections";
import BackButton from "@/components/kaming/backbutton";
import { useSession } from "@/lib/mockAuth";
import { getProductByName, isProductOwned, updateLastWatched, getOwnedByUser, type MockProduct, type MockVideo } from "@/lib/mockStore";

import styles from "@/styles/kaming/belajar.module.css";
import commonStyles from "@/styles/kaming/common.module.css";

export default function BelajarPage() {
  const params = useParams();
  const key = decodeURIComponent(params.key as string);
  const { data: session, status } = useSession();

  const [product, setProduct] = useState<MockProduct | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MockVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setIsForbidden(true);
      setLoading(false);
      return;
    }

    const prod = getProductByName(key);
    if (!prod) {
      setLoading(false);
      return;
    }

    const owned = isProductOwned(session.user.id, prod._id);
    if (!owned) {
      setIsForbidden(true);
      setLoading(false);
      return;
    }

    setProduct(prod);

    // Pick last watched video or first
    const ups = getOwnedByUser(session.user.id);
    const up = ups.find((u) => u.productId === prod._id);
    const lastVid = prod.video.find((v) => v._id === up?.lastWatchedVideoId);
    setSelectedVideo(lastVid ?? prod.video[0] ?? null);
    setLoading(false);
  }, [key, status, session]);

  const handleSelectVideo = (video: MockVideo) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (session?.user && product) {
      updateLastWatched(session.user.id, product._id, video._id);
    }
  };

  if (loading) {
    return <Section><div className={styles.belajarPage_loading}>Memuat kursus...</div></Section>;
  }

  if (isForbidden) {
    return (
      <Section>
        <div className={styles.belajarPage_infoPanel} style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
          <h3 className={styles.belajarPage_carouselTitle} style={{ borderBottom: "none", marginBottom: "1rem", fontSize: "1.5rem" }}>
            Akses Ditolak
          </h3>
          <p style={{ color: "#d1d5db", marginBottom: "2rem" }}>
            Anda harus memiliki kursus ini terlebih dahulu untuk dapat mengaksesnya.
          </p>
          <Link href="/produk" passHref className={commonStyles.buttonPrimary}>
            Lihat Daftar Kursus
          </Link>
        </div>
      </Section>
    );
  }

  if (!product) {
    return <Section><div>Kursus tidak ditemukan.</div></Section>;
  }

  return (
    <Section>
      <div className={styles.belajarPage_header}>
        <BackButton />
      </div>

      <div className={styles.belajarPage_playerWrapper}>
        {selectedVideo ? (
          <iframe
            key={selectedVideo._id}
            src={`https://www.youtube.com/embed/${selectedVideo.kodePelajaran}?autoplay=1&modestbranding=1&rel=0`}
            title={selectedVideo.namaPelajaran}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className={styles.belajarPage_noVideo}>Pilih video untuk diputar</div>
        )}
      </div>

      <div className={styles.belajarPage_infoPanel}>
        <h1 className={styles.belajarPage_infoTitle}>
          {product.name} — {selectedVideo?.namaPelajaran}
        </h1>
        <p className={styles.belajarPage_courseDesc}>{product.desc}</p>
      </div>

      <div className={styles.belajarPage_carouselContainer}>
        <h3 className={styles.belajarPage_carouselTitle}>Daftar Pelajaran</h3>
        <div className={styles.belajarPage_carouselScroller}>
          {product.video.map((video) => (
            <div
              key={video._id}
              className={`${styles.belajarPage_thumbnailCard} ${
                selectedVideo?._id === video._id ? styles.belajarPage_thumbnailCard_active : ""
              }`}
              onClick={() => handleSelectVideo(video)}
            >
              <div className={styles.belajarPage_thumbnailImage}>
                <Image
                  src={`https://i.ytimg.com/vi/${video.kodePelajaran}/hq720.jpg`}
                  alt={video.namaPelajaran}
                  width={1280}
                  height={720}
                  className={styles.belajarPage_Image}
                  loading="lazy"
                />
              </div>
              <h4 className={styles.belajarPage_thumbnailTitle}>{video.namaPelajaran}</h4>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
