"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/kaming/backbutton";
import Section from "@/components/sections";
import TabSwitcher from "@/components/kaming/TabSwitcher";
import ProductForm, { ProductFormData } from "@/components/kaming/ProductForm";
import { getProducts, type MockProduct } from "@/lib/mockStore";

import editPageStyles from "@/styles/kaming/adminProductEdit.module.css";
import modalStyles from "@/styles/kaming/modal.module.css";

interface Video {
  _id: string;
  namaPelajaran: string;
  kodePelajaran: string;
}

function saveProductsToStorage(products: MockProduct[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("trainity_products", JSON.stringify(products));
  }
}

export default function EditProductPage() {
  const { id } = useParams();
  const [tab, setTab] = useState<"kursus" | "video">("kursus");
  const [product, setProduct] = useState<MockProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({ name: "", shortDesc: "", desc: "" });
  const [namaPelajaran, setNamaPelajaran] = useState("");
  const [kodePelajaran, setKodePelajaran] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editKode, setEditKode] = useState("");

  useEffect(() => {
    if (!id) return;
    const found = getProducts().find((p) => p._id === id);
    if (found) {
      setProduct(found);
      setFormData({ name: found.name, shortDesc: found.shortDesc, desc: found.desc });
    } else {
      setMessage("Produk tidak ditemukan.");
    }
  }, [id]);

  function updateProductInStore(updated: MockProduct) {
    const all = getProducts().map((p) => (p._id === updated._id ? updated : p));
    saveProductsToStorage(all);
    setProduct(updated);
  }

  function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    const updated: MockProduct = {
      ...product,
      name: formData.name,
      shortDesc: formData.shortDesc,
      desc: formData.desc,
    };
    updateProductInStore(updated);
    setMessage("✅ Perubahan kursus tersimpan");
    setLoading(false);
  }

  function handleAddVideo() {
    if (!namaPelajaran || !kodePelajaran) { setMessage("Isi nama & kode pelajaran!"); return; }
    if (!product) return;
    setLoading(true);
    const newVideo: Video = { _id: `v-${Date.now()}`, namaPelajaran, kodePelajaran };
    const updated: MockProduct = {
      ...product,
      video: [...product.video, newVideo],
      kodePelajaranPertama: product.kodePelajaranPertama || newVideo.kodePelajaran,
    };
    updateProductInStore(updated);
    setNamaPelajaran("");
    setKodePelajaran("");
    setMessage("✅ Video ditambahkan");
    setLoading(false);
  }

  function handleUpdateVideo() {
    if (!selectedVideo || !product) return;
    setLoading(true);
    const updated: MockProduct = {
      ...product,
      video: product.video.map((v) =>
        v._id === selectedVideo._id ? { ...v, namaPelajaran: editNama, kodePelajaran: editKode } : v,
      ),
    };
    updateProductInStore(updated);
    setMessage("✅ Video diperbarui");
    setShowEditModal(false);
    setLoading(false);
  }

  function handleDeleteVideo() {
    if (!selectedVideo || !product) return;
    setLoading(true);
    const newVideos = product.video.filter((v) => v._id !== selectedVideo._id);
    const updated: MockProduct = {
      ...product,
      video: newVideos,
      kodePelajaranPertama: newVideos[0]?.kodePelajaran ?? "",
    };
    updateProductInStore(updated);
    setMessage("🗑️ Video dihapus");
    setShowDeleteModal(false);
    setLoading(false);
  }

  const tabs = [
    { key: "kursus" as const, label: "Informasi Kursus" },
    { key: "video" as const, label: "Video Kursus" },
  ];

  return (
    <Section>
      <div className={editPageStyles.editPage_container}>
        <div className={editPageStyles.editPage_contentWrapper}>
          <div className={editPageStyles.editPage_card}>
            <BackButton />
            <h1 className={editPageStyles.editPage_title}>Edit Kursus</h1>
            <p className={editPageStyles.editPage_subtitle}>{product?.name ?? "..."}</p>

            <TabSwitcher tabs={tabs} activeTab={tab} onTabClick={setTab} />

            <AnimatePresence mode="wait">
              {tab === "kursus" && (
                <motion.div key="kursus">
                  <ProductForm
                    formData={formData}
                    onFormChange={setFormData}
                    onSubmit={handleUpdateProduct}
                    submitText="Simpan Perubahan"
                    isLoading={loading}
                  />
                </motion.div>
              )}

              {tab === "video" && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className={editPageStyles.editVideo_tabContent}
                >
                  <div className={editPageStyles.editVideo_formContainer}>
                    <h3 className={editPageStyles.editVideo_sectionTitle}>Tambah Video</h3>
                    <div className={editPageStyles.editVideo_inputGroup}>
                      <input
                        type="text"
                        placeholder="Nama Pelajaran"
                        value={namaPelajaran}
                        onChange={(e) => setNamaPelajaran(e.target.value)}
                        className={editPageStyles.editVideo_input}
                      />
                      <input
                        type="text"
                        placeholder="Kode YouTube"
                        value={kodePelajaran}
                        onChange={(e) => setKodePelajaran(e.target.value)}
                        className={editPageStyles.editVideo_input}
                      />
                      <button onClick={handleAddVideo} disabled={loading} className={editPageStyles.editVideo_addButton}>
                        {loading ? "Menambahkan..." : "Tambah"}
                      </button>
                    </div>
                  </div>

                  <div className={editPageStyles.editVideo_listContainer}>
                    <h3 className={editPageStyles.editVideo_listTitle}>Daftar Video</h3>
                    {!product?.video?.length ? (
                      <p className={editPageStyles.editVideo_emptyListText}>Belum ada video.</p>
                    ) : (
                      <ul className={editPageStyles.editVideo_list}>
                        {product.video.map((v) => (
                          <li key={v._id} className={editPageStyles.editVideo_listItem}>
                            <div>
                              <div className={editPageStyles.editVideo_name}>{v.namaPelajaran}</div>
                              <div className={editPageStyles.editVideo_code}>{v.kodePelajaran}</div>
                            </div>
                            <div className={editPageStyles.editVideo_actions}>
                              <button
                                onClick={() => { setSelectedVideo(v); setEditNama(v.namaPelajaran); setEditKode(v.kodePelajaran); setShowEditModal(true); }}
                                className={editPageStyles.editVideo_editButton}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => { setSelectedVideo(v); setShowDeleteModal(true); }}
                                className={editPageStyles.editVideo_deleteButton}
                              >
                                Hapus
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {message && <p className={editPageStyles.editPage_message}>{message}</p>}
          </div>
        </div>
      </div>

      {/* Modal Edit Video */}
      <AnimatePresence>
        {showEditModal && selectedVideo && (
          <motion.div className={modalStyles.modal_backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={modalStyles.modal_content} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className={modalStyles.modal_title}>Edit Video</h3>
              <input value={editNama} onChange={(e) => setEditNama(e.target.value)} placeholder="Nama Pelajaran" className={modalStyles.modal_inputNama} />
              <input value={editKode} onChange={(e) => setEditKode(e.target.value)} placeholder="Kode YouTube" className={modalStyles.modal_inputKode} />
              <div className={modalStyles.modal_actionsEnd}>
                <button onClick={() => setShowEditModal(false)} className={modalStyles.modal_buttonSecondary}>Batal</button>
                <button onClick={handleUpdateVideo} disabled={loading} className={modalStyles.modal_buttonPrimary}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Hapus Video */}
      <AnimatePresence>
        {showDeleteModal && selectedVideo && (
          <motion.div className={modalStyles.modal_backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={`${modalStyles.modal_content} ${modalStyles.modal_contentDelete}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className={modalStyles.modal_titleDelete}>Hapus Video Ini?</h3>
              <p className={modalStyles.modal_text}>{`${selectedVideo.namaPelajaran} akan dihapus.`}</p>
              <div className={modalStyles.modal_actionsCenter}>
                <button onClick={() => setShowDeleteModal(false)} className={modalStyles.modal_buttonSecondary}>Batal</button>
                <button onClick={handleDeleteVideo} disabled={loading} className={modalStyles.modal_buttonDanger}>
                  {loading ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
