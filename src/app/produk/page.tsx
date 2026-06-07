"use client";

import { useState, useEffect } from "react";
import Section from "@/components/sections";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { getProducts, type MockProduct } from "@/lib/mockStore";

import styles from "@/styles/kaming/publicProduk.module.css";
import formStyles from "@/styles/kaming/adminProductList.module.css";

export default function ProdukPage() {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setProducts(getProducts(debouncedSearch || undefined));
  }, [debouncedSearch]);

  return (
    <Section>
      <div className={styles.produkPage_container}>
        <div className={styles.produkPage_hero}>
          <h1 className={styles.produkPage_title}>Telusuri Kursus Kami</h1>
          <p className={styles.produkPage_subtitle}>
            Temukan kursus yang Anda butuhkan untuk meningkatkan keahlian Anda.
          </p>
        </div>

        <div className={formStyles.listPage_videoFormContainer} style={{ marginBottom: "2rem" }}>
          <div className={formStyles.listPage_inputGroup}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kursus..."
              className={formStyles.listPage_videoInput}
            />
          </div>
        </div>

        <div className={styles.produkPage_grid}>
          {products.map((product) => (
            <div key={product._id} className={styles.produkPage_card}>
              <div className={styles.produkPage_cardImageWrapper}>
                <Image
                  src={`https://i.ytimg.com/vi/${product.kodePelajaranPertama}/hq720.jpg`}
                  alt={product.name}
                  fill
                  className={styles.produkPage_cardImage}
                />
              </div>
              <div className={styles.produkPage_cardBody}>
                <h3 className={styles.produkPage_cardTitle}>{product.name}</h3>
                <p className={styles.produkPage_cardDesc}>{product.shortDesc}</p>
                <div className={styles.produkPage_cardFooter}>
                  <span className={styles.produkPage_cardPrice_free}>Gratis</span>
                  <Link href={`/produk/${product.name}`} passHref>
                    <button className={styles.produkPage_buyButton}>Cek Produk</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className={formStyles.emptyListText} style={{ marginTop: "2rem" }}>
            {searchTerm ? `Tidak ada hasil untuk "${searchTerm}".` : "Belum ada kursus."}
          </p>
        )}
      </div>
    </Section>
  );
}
