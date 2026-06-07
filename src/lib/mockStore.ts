// Mock data store — replaces all backend API calls.
// Mutable state persists in localStorage; lost when browser clears storage.

export interface MockVideo {
  _id: string;
  namaPelajaran: string;
  kodePelajaran: string;
}

export interface MockProduct {
  _id: string;
  name: string;
  shortDesc: string;
  desc: string;
  video: MockVideo[];
  kodePelajaranPertama: string;
  price: number;
}

export interface MockUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface MockReview {
  _id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: string;
}

export interface MockUserProduct {
  _id: string;
  userId: string;
  productId: string;
  lastWatchedVideoId: string | null;
  createdAt: string;
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_PRODUCTS: MockProduct[] = [
  {
    _id: "prod-001",
    name: "Belajar Python Dasar",
    shortDesc: "Kuasai Python dari nol, cocok untuk pemula absolute.",
    desc: "Kursus Python komprehensif yang membahas variabel, tipe data, kontrol alur, fungsi, OOP, hingga proyek nyata. Tidak diperlukan pengalaman programming sebelumnya.",
    video: [
      { _id: "v-001-1", namaPelajaran: "Pengenalan Python & Instalasi", kodePelajaran: "rfscVS0vtbw" },
      { _id: "v-001-2", namaPelajaran: "Variabel & Tipe Data", kodePelajaran: "8JJ101D3knE" },
      { _id: "v-001-3", namaPelajaran: "Kontrol Alur (if, for, while)", kodePelajaran: "nLRL_NcnK-4" },
    ],
    kodePelajaranPertama: "rfscVS0vtbw",
    price: 0,
  },
  {
    _id: "prod-002",
    name: "JavaScript Modern",
    shortDesc: "JavaScript ES6+ lengkap: async/await, fetch, dan DOM.",
    desc: "Pelajari JavaScript modern dari dasar hingga advanced. Materi mencakup ES6+, promises, async/await, fetch API, manipulasi DOM, dan pengembangan aplikasi web interaktif.",
    video: [
      { _id: "v-002-1", namaPelajaran: "JavaScript Dasar & ES6", kodePelajaran: "PkZNo7MFNFg" },
      { _id: "v-002-2", namaPelajaran: "DOM Manipulation", kodePelajaran: "W6NZfCO5SIk" },
      { _id: "v-002-3", namaPelajaran: "Async/Await & Fetch API", kodePelajaran: "jS4aFq5-91M" },
    ],
    kodePelajaranPertama: "PkZNo7MFNFg",
    price: 0,
  },
  {
    _id: "prod-003",
    name: "React untuk Pemula",
    shortDesc: "Bangun UI modern dengan React Hooks dan komponen.",
    desc: "Kursus React yang membahas komponen, props, state, hooks (useState, useEffect, useContext), React Router, dan integrasi dengan REST API. Cocok bagi yang sudah memahami JavaScript dasar.",
    video: [
      { _id: "v-003-1", namaPelajaran: "Pengenalan React & JSX", kodePelajaran: "Ke90Tje7VS0" },
      { _id: "v-003-2", namaPelajaran: "useState & useEffect", kodePelajaran: "bMknfKXIFA8" },
      { _id: "v-003-3", namaPelajaran: "React Router & Fetch", kodePelajaran: "SqcY0GlETPk" },
    ],
    kodePelajaranPertama: "Ke90Tje7VS0",
    price: 0,
  },
];

const SEED_USERS: MockUser[] = [
  {
    _id: "user-admin-001",
    username: "Admin Trainity",
    email: "admin@trainity.com",
    password: "password123",
    role: "admin",
  },
  {
    _id: "user-demo-001",
    username: "Demo User",
    email: "demo@trainity.com",
    password: "password123",
    role: "user",
  },
];

const SEED_REVIEWS: MockReview[] = [
  {
    _id: "rev-001",
    userId: "user-demo-001",
    userName: "Demo User",
    productId: "prod-001",
    productName: "Belajar Python Dasar",
    rating: 5,
    comment: "Kursus sangat bagus dan mudah dipahami, materinya lengkap!",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "approved",
  },
  {
    _id: "rev-002",
    userId: "user-demo-001",
    userName: "Demo User",
    productId: "prod-002",
    productName: "JavaScript Modern",
    rating: 4,
    comment: "Penjelasan async/await sangat membantu. Recommended!",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "approved",
  },
];

const SEED_USERPROD: MockUserProduct[] = [
  {
    _id: "up-001",
    userId: "user-demo-001",
    productId: "prod-001",
    lastWatchedVideoId: "v-001-2",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsGet<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function lsSet<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function getProducts(searchKey?: string): MockProduct[] {
  const products = lsGet("trainity_products", SEED_PRODUCTS);
  if (!searchKey) return products;
  const lower = searchKey.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(lower));
}

export function getProductByName(name: string): MockProduct | undefined {
  return getProducts().find((p) => p.name === name || p.name === decodeURIComponent(name));
}

export function addProduct(product: Omit<MockProduct, "_id">): MockProduct {
  const products = getProducts();
  const newProd: MockProduct = { ...product, _id: `prod-${Date.now()}` };
  lsSet("trainity_products", [...products, newProd]);
  return newProd;
}

export function deleteProduct(id: string): void {
  lsSet("trainity_products", getProducts().filter((p) => p._id !== id));
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): MockUser[] {
  return lsGet("trainity_users", SEED_USERS);
}

export function getUserByEmail(email: string): MockUser | undefined {
  return getUsers().find((u) => u.email === email);
}

export function getUserById(id: string): MockUser | undefined {
  return getUsers().find((u) => u._id === id);
}

export function addUser(user: Omit<MockUser, "_id">): MockUser {
  const users = getUsers();
  if (users.find((u) => u.email === user.email)) {
    throw new Error("Email sudah terdaftar");
  }
  const newUser: MockUser = { ...user, _id: `user-${Date.now()}` };
  lsSet("trainity_users", [...users, newUser]);
  return newUser;
}

export function updateUser(id: string, data: Partial<Pick<MockUser, "username" | "email">>): MockUser {
  const users = getUsers();
  const updated = users.map((u) => (u._id === id ? { ...u, ...data } : u));
  lsSet("trainity_users", updated);
  return updated.find((u) => u._id === id)!;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function getReviews(productId?: string): MockReview[] {
  const reviews = lsGet("trainity_reviews", SEED_REVIEWS);
  if (!productId) return reviews;
  return reviews.filter((r) => r.productId === productId);
}

export function getReviewsByProductName(productName: string): MockReview[] {
  const product = getProductByName(productName);
  if (!product) return [];
  return getReviews(product._id);
}

export function addReview(review: Omit<MockReview, "_id" | "createdAt" | "status">): MockReview {
  const reviews = lsGet("trainity_reviews", SEED_REVIEWS);
  const newReview: MockReview = {
    ...review,
    _id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "approved",
  };
  lsSet("trainity_reviews", [...reviews, newReview]);
  return newReview;
}

export function deleteReview(id: string): void {
  lsSet("trainity_reviews", lsGet("trainity_reviews", SEED_REVIEWS).filter((r) => r._id !== id));
}

// ─── UserProducts (purchases) ─────────────────────────────────────────────────

export function getUserProducts(): MockUserProduct[] {
  return lsGet("trainity_userproducts", SEED_USERPROD);
}

export function getOwnedByUser(userId: string): MockUserProduct[] {
  return getUserProducts().filter((up) => up.userId === userId);
}

export function isProductOwned(userId: string, productId: string): boolean {
  return getUserProducts().some((up) => up.userId === userId && up.productId === productId);
}

export function buyProduct(userId: string, productId: string): MockUserProduct {
  if (isProductOwned(userId, productId)) throw new Error("Sudah dimiliki");
  const all = getUserProducts();
  const newUp: MockUserProduct = {
    _id: `up-${Date.now()}`,
    userId,
    productId,
    lastWatchedVideoId: null,
    createdAt: new Date().toISOString(),
  };
  lsSet("trainity_userproducts", [...all, newUp]);
  return newUp;
}

export function updateLastWatched(userId: string, productId: string, videoId: string): void {
  const all = getUserProducts();
  lsSet(
    "trainity_userproducts",
    all.map((up) =>
      up.userId === userId && up.productId === productId
        ? { ...up, lastWatchedVideoId: videoId }
        : up,
    ),
  );
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

export function getProgress(userId: string, productId: string): number {
  const up = getUserProducts().find((u) => u.userId === userId && u.productId === productId);
  if (!up) return 0;
  const product = getProducts().find((p) => p._id === productId);
  if (!product || product.video.length === 0) return 0;
  if (!up.lastWatchedVideoId) return 0;
  const watchedIndex = product.video.findIndex((v) => v._id === up.lastWatchedVideoId);
  if (watchedIndex === -1) return 0;
  return Math.round(((watchedIndex + 1) / product.video.length) * 100);
}

// ─── Dashboard helpers ────────────────────────────────────────────────────────

export function getAdminDashboard() {
  const ups = getUserProducts();
  const users = getUsers();
  const products = getProducts();
  const reviews = getReviews();

  const latestUserActivity = ups
    .slice(-5)
    .reverse()
    .map((up) => {
      const user = users.find((u) => u._id === up.userId);
      const product = products.find((p) => p._id === up.productId);
      return {
        userName: user?.username ?? "Unknown",
        productName: product?.name ?? "Unknown",
        purchasedAt: up.createdAt,
      };
    });

  const latestReviews = reviews
    .slice(-5)
    .reverse()
    .map((r) => ({
      productName: r.productName,
      rating: r.rating,
      comment: r.comment,
      userName: r.userName,
      reviewedAt: r.createdAt,
    }));

  return { latestUserActivity, latestReviews };
}

// ─── Admin purchases list ─────────────────────────────────────────────────────

export function getPurchaseHistory(page: number, limit: number, search: string) {
  const all = getUserProducts();
  const users = getUsers();
  const products = getProducts();

  const enriched = all.map((up) => ({
    _id: up._id,
    user: { email: users.find((u) => u._id === up.userId)?.email ?? "unknown@email.com" },
    product: { name: products.find((p) => p._id === up.productId)?.name ?? "Unknown" },
    createdAt: up.createdAt,
  }));

  const filtered = search
    ? enriched.filter(
        (e) =>
          e.user.email.toLowerCase().includes(search.toLowerCase()) ||
          e.product.name.toLowerCase().includes(search.toLowerCase()),
      )
    : enriched;

  const total = filtered.length;
  const start = (page - 1) * limit;
  const userProducts = filtered.reverse().slice(start, start + limit);
  const hasNext = start + limit < total;

  return { userProducts, pagination: { total, hasNext } };
}
