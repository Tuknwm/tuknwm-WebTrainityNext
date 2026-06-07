"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/mockAuth";
import { getProductByName, buyProduct, isProductOwned, type MockProduct } from "@/lib/mockStore";
import PaymentMethod from "./PaymentMethod";
import OrderSummary from "./OrderSummary";
import OrderPopup from "./OrderPopup";
import LoadingScreen from "../LoadingScreen";

const PAYMENT_METHODS: PaymentMethodType[] = [
  { id: "voucher", name: "Discount 100%", image: "/Payment/FREE.svg", alt: "FREE", isVoucher: true, disabled: false },
  { id: "bca", name: "BCA", image: "/Payment/BCA.svg", alt: "BCA", inputLabel: "Nomor Rekening BCA", inputPlaceholder: "Masukkan nomor rekening BCA Anda" },
  { id: "mandiri", name: "Mandiri", image: "/Payment/MANDIRI.svg", alt: "Mandiri", inputLabel: "Nomor Rekening Mandiri", inputPlaceholder: "Masukkan nomor rekening Mandiri Anda" },
  { id: "bri", name: "BRI", image: "/Payment/BRI.svg", alt: "BRI", inputLabel: "Nomor Rekening BRI", inputPlaceholder: "Masukkan nomor rekening BRI Anda" },
  { id: "cimb", name: "CIMB Niaga", image: "/Payment/CIMB.svg", alt: "CIMB Niaga", inputLabel: "Nomor Rekening CIMB Niaga", inputPlaceholder: "Masukkan nomor rekening CIMB Anda" },
  { id: "ocbc", name: "OCBC NISP", image: "/Payment/OCBC.svg", alt: "OCBC NISP", inputLabel: "Nomor Rekening OCBC", inputPlaceholder: "Masukkan nomor rekening OCBC Anda" },
  { id: "paypal", name: "PayPal", image: "/Payment/PayPal.svg", alt: "PayPal", inputType: "email", inputLabel: "Email PayPal", inputPlaceholder: "Masukkan email PayPal Anda" },
  { id: "ovo", name: "OVO", image: "/Payment/OVO.svg", alt: "OVO", inputLabel: "Nomor Telepon OVO", inputPlaceholder: "Masukkan nomor HP OVO Anda" },
  { id: "dana", name: "DANA", image: "/Payment/DANA.svg", alt: "DANA", inputLabel: "Nomor Telepon DANA", inputPlaceholder: "Masukkan nomor HP DANA Anda" },
  { id: "gopay", name: "GoPay", image: "/Payment/GoPay.svg", alt: "GoPay", inputLabel: "Nomor Telepon GoPay", inputPlaceholder: "Masukkan nomor HP GoPay Anda" },
  { id: "qris", name: "QRIS", image: "/Payment/QRIS.svg", alt: "QRIS", hasQR: true },
  { id: "shopeepay", name: "ShopeePay", image: "/Payment/ShopeePay.svg", alt: "ShopeePay", inputLabel: "Nomor Telepon ShopeePay", inputPlaceholder: "Masukkan nomor HP ShopeePay Anda" },
];

export default function CheckoutContainer() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productKey = decodeURIComponent(params.key as string);

  const [isLoading, setIsLoading] = useState(true);
  const [activeMethod, setActiveMethod] = useState<string>("voucher");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isAgree, setIsAgree] = useState(false);
  const [product, setProduct] = useState<MockProduct | null>(null);
  const [popupContent, setPopupContent] = useState<PopupContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "loading") return;

    setTimeout(() => {
      if (!productKey) {
        setIsLoading(false);
        setPopupContent({ icon: "⚠️", color: "orange", title: "Akses Ditolak!", message: "Silakan pilih kursus terlebih dahulu", buttonText: "Pergi ke Kursus", redirectTo: "/produk" });
        return;
      }

      const prod = getProductByName(productKey);
      if (!prod) {
        setIsLoading(false);
        setPopupContent({ icon: "❌", color: "red", title: "Tidak Ditemukan", message: "Produk tidak ditemukan", buttonText: "Kembali ke Produk", redirectTo: "/produk" });
        return;
      }

      if (session?.user && isProductOwned(session.user.id, prod._id)) {
        setPopupContent({ icon: "⚠️", color: "orange", title: "Oops!", message: "Anda sudah membeli produk ini", buttonText: "Mulai Belajar", redirectTo: `/user/belajar/${prod.name}` });
        setIsLoading(false);
        return;
      }

      setProduct(prod);
      setIsLoading(false);
    }, 800);
  }, [productKey, status, session]);

  const handleTouchStart = (e: React.TouchEvent) => { setStartY(e.touches[0].clientY); setIsDragging(true); };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) { e.preventDefault(); setSheetHeight(Math.max(0, 70 - (diff / window.innerHeight) * 100)); }
  };
  const handleTouchEnd = () => { setIsDragging(false); if (sheetHeight < 50) closeBottomSheet(); else setSheetHeight(70); };
  const openBottomSheet = () => { setIsBottomSheetOpen(true); setSheetHeight(70); document.body.style.overflow = "hidden"; };
  const closeBottomSheet = () => { setIsBottomSheetOpen(false); setSheetHeight(0); document.body.style.overflow = "unset"; };
  const handleCheckboxChange = (id: string) => { if (id === "voucher") return; setActiveMethod(activeMethod === id ? "" : id); closeBottomSheet(); };
  const handleInputChange = (id: string, value: string) => setInputValues((prev) => ({ ...prev, [id]: value }));

  const isFormValid = () => {
    if (!isAgree || !activeMethod) return false;
    const method = PAYMENT_METHODS.find((m) => m.id === activeMethod);
    if (method && !method.isVoucher && !method.hasQR) return (inputValues[activeMethod]?.trim() ?? "") !== "";
    return true;
  };

  const handlePlaceOrder = () => {
    if (!product) return;

    if (status !== "authenticated" || !session?.user) {
      setPopupContent({ icon: "🔒", color: "orange", title: "Login Required", message: "Silakan login terlebih dahulu", buttonText: "Pergi ke Login", redirectTo: "/auth/login" });
      return;
    }

    setIsProcessing(true);
    try {
      buyProduct(session.user.id, product._id);
      router.push(`/user/pembelian/success/${encodeURIComponent(productKey)}`);
    } catch {
      setIsProcessing(false);
      setPopupContent({ icon: "❌", color: "red", title: "Terjadi Kesalahan", message: "Gagal memproses pesanan", buttonText: "Tutup", redirectTo: `/user/pembelian/checkout/${encodeURIComponent(productKey)}` });
    }
  };

  const voucherMethod = PAYMENT_METHODS.find((m) => m.isVoucher);
  const otherMethods = PAYMENT_METHODS.filter((m) => !m.isVoucher);
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === activeMethod);

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <OrderPopup content={popupContent} isProcessing={isProcessing} />

      <section>
        <div className="checkout-container" style={{ visibility: isLoading ? "hidden" : "visible", opacity: isLoading ? 0 : 1 }}>
          <div className="checkout-box">
            <div className="checkout-left desktop-only">
              <h1>CHECKOUT</h1>
              <h2>VOUCHER</h2>
              {voucherMethod && (
                <PaymentMethod method={voucherMethod} isActive={activeMethod === voucherMethod.id} isDisabled={false} inputValue="" onCheckboxChange={handleCheckboxChange} onInputChange={handleInputChange} />
              )}
              <h2>OTHER PAYMENT METHODS</h2>
              {otherMethods.map((method) => (
                <PaymentMethod key={method.id} method={method} isActive={activeMethod === method.id} isDisabled={activeMethod === "voucher"} inputValue={inputValues[method.id] || ""} onCheckboxChange={handleCheckboxChange} onInputChange={handleInputChange} />
              ))}
            </div>

            {product && (
              <OrderSummary
                courseTitle={product.name}
                thumbnailUrl={`https://i.ytimg.com/vi/${product.kodePelajaranPertama}/hqdefault.jpg`}
                price={product.price}
                isAgree={isAgree}
                onAgreeChange={setIsAgree}
                onPlaceOrder={handlePlaceOrder}
                isDisabled={!isFormValid()}
              />
            )}

            <div className="mobile-payment-selector mobile-only" onClick={openBottomSheet}>
              <div className="payment-selector-content">
                <div>
                  <div className="payment-label">Payment Method:</div>
                  <div className="payment-selected">
                    {selectedMethod?.image && <Image src={selectedMethod.image} alt={selectedMethod.alt || ""} width={40} height={28} className="payment-selected-icon" />}
                    {selectedMethod?.name}
                  </div>
                </div>
                <div className="payment-arrow">›</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isBottomSheetOpen && <div className="bottom-sheet-overlay" onClick={closeBottomSheet} />}
      {isBottomSheetOpen && (
        <div ref={sheetRef} className="bottom-sheet" style={{ height: `${sheetHeight}vh` }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="drag-handle" />
          <div className="bottom-sheet-content">
            <h2>Select Payment Method</h2>
            <h3 className="payment-section-title">VOUCHER</h3>
            {voucherMethod && <PaymentMethod method={voucherMethod} isActive={activeMethod === voucherMethod.id} isDisabled={false} inputValue="" onCheckboxChange={handleCheckboxChange} onInputChange={handleInputChange} />}
            <h3 className="payment-section-title">OTHER PAYMENT METHODS</h3>
            {otherMethods.map((method) => (
              <PaymentMethod key={method.id} method={method} isActive={activeMethod === method.id} isDisabled={activeMethod === "voucher"} inputValue={inputValues[method.id] || ""} onCheckboxChange={handleCheckboxChange} onInputChange={handleInputChange} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
