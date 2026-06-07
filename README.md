# Trainity

Platform belajar coding gratis berbasis web. Pengguna dapat mendaftar, mengikuti kursus melalui video pembelajaran, memantau progress belajar, dan mendapatkan sertifikat digital setelah menyelesaikan 100% materi.

---

## Quick Start

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di browser.

**Tidak perlu environment variable** — aplikasi berjalan sepenuhnya di sisi browser menggunakan localStorage.

---

## Demo Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@trainity.com     | password123 |
| User  | demo@trainity.com      | password123 |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **React:** React 19
- **Auth:** Custom mock auth (localStorage-based, tanpa NextAuth)
- **Data:** localStorage (tidak ada database/backend)
- **Animasi:** GSAP, Framer Motion
- **PDF/Sertifikat:** html2canvas + jsPDF
- **Styling:** CSS Modules
- **Icons:** Lucide React, Boxicons

---

## Struktur Proyek

```
src/
├── app/              # Halaman (App Router)
│   ├── admin/        # Dashboard admin, kelola produk & review
│   ├── auth/         # Login, register, forgot-password
│   ├── produk/       # Halaman kursus publik
│   └── user/         # Dashboard, belajar, sertifikat, profil
├── components/       # UI components (dikelompokkan per kontributor)
├── lib/
│   ├── mockAuth.tsx  # Sistem autentikasi berbasis localStorage
│   └── mockStore.ts  # Data store (produk, user, review, pembelian)
└── styles/           # CSS Modules per fitur
```

---

## Fitur

- Intro splash screen animasi (GSAP)
- Halaman kursus publik dengan thumbnail YouTube
- Sistem beli kursus (mock checkout)
- Video player dengan tracking progress per video
- Sertifikat digital (PDF) — muncul setelah progress 100%
- Panel admin: kelola kursus, review, riwayat pembelian
- Edit profil pengguna
- Semua data tersimpan di localStorage browser

---

## Scripts

```bash
npm run dev      # Development server (Turbopack)
npm run build    # Build production
npm start        # Jalankan production build
npm run lint     # ESLint
```

---

## Deployment

Deploy ke Vercel langsung tanpa konfigurasi tambahan — tidak ada environment variable yang dibutuhkan.
