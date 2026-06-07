"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminHistoryItem from "./AdminHistoryItem";
import { getPurchaseHistory } from "@/lib/mockStore";

interface HistoryItem {
  orderId: string;
  transactionId: string;
  accountInfo: string;
  merchant: string;
  paymentMethod: string;
  paymentLogo: string;
  totalAmount: string;
  date: string;
  status: "success";
  statusText: string;
}

export default function AdminHistoryForm() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = (currentPage: number, search: string, reset = false) => {
    setLoading(true);
    const result = getPurchaseHistory(currentPage, 20, search);
    const formatted: HistoryItem[] = result.userProducts.map((item, idx) => {
      const prefix = item.product.name.split(" ")[0].toUpperCase();
      const counter = result.pagination.total - (currentPage - 1) * 20 - idx;
      return {
        orderId: `ORD${String(counter).padStart(4, "0")}`,
        transactionId: `${prefix}-${String(counter).padStart(4, "0")}`,
        accountInfo: item.user.email,
        merchant: item.product.name,
        paymentMethod: "Voucher",
        paymentLogo: "/Payment/FREE.svg",
        totalAmount: "Gratis",
        date: new Date(item.createdAt).toLocaleString("id-ID"),
        status: "success",
        statusText: "Berhasil",
      };
    });

    setItems((prev) => (reset ? formatted : [...prev, ...formatted]));
    setTotal(result.pagination.total);
    setHasMore(result.pagination.hasNext);
    if (!reset) setPage(currentPage + 1);
    setLoading(false);
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setItems([]);
      setPage(1);
      setHasMore(false);
      fetchData(1, searchQuery, true);
    }, 500);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchData(page, searchQuery);
  };

  return (
    <main>
      <section>
        <div className="admin-history-container">
          <div className="admin-history-header">
            <div className="header-left">
              <h1>Pembelian User</h1>
              <p>Kelola semua transaksi pembelian kursus</p>
            </div>
            <div className="header-right">
              <div className="search-container">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Cari Email / Produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {loading && items.length === 0 ? (
            <div className="no-history">
              <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "60px" }}></i>
              <p>Sedang memuat data pembelian...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="no-history">
              <i className="bx bx-cart-alt"></i>
              <p>Tidak ada data pembelian ditemukan</p>
            </div>
          ) : (
            <>
              <div className="admin-history-grid">
                {items.map((item, idx) => (
                  <AdminHistoryItem key={item.orderId} item={item} index={idx} />
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: "center", margin: "2rem 0" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    style={{ padding: "0.8rem 2rem", background: loading ? "#444" : "#1369ff", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "500" }}
                  >
                    {loading ? "Memuat..." : "Muat Lebih Banyak"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
