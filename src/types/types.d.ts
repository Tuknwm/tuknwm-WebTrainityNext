declare global {
  export interface IVideo {
    _id: string;
    namaPelajaran: string;
    kodePelajaran: string;
  }

  interface Video {
    _id: string;
    namaPelajaran: string;
    kodePelajaran: string;
  }

  interface Product {
    _id: string;
    name: string;
    shortDesc: string;
    desc: string;
    video: Video[];
  }

  interface ProductData {
    _id: string;
    name: string;
    desc: string;
    video: Video[];
  }

  type AppError = unknown;

  export interface Course {
    videos: Array<{ link: string }>;
  }

  export interface CourseData {
    [key: string]: Course;
  }

  export interface CoursePrices {
    [key: string]: number;
  }

  export interface PaymentMethodType {
    id: string;
    name: string;
    image: string;
    alt: string;
    inputType?: "text" | "email";
    inputPlaceholder?: string;
    inputLabel?: string;
    isVoucher?: boolean;
    hasQR?: boolean;
    disabled?: boolean;
  }

  export interface UserOrder {
    user: string;
    kursus: string[];
  }

  export interface PopupContent {
    icon: string;
    color: string;
    title: string;
    message: string;
    buttonText?: string;
    redirectTo?: string;
  }
}

export {};
