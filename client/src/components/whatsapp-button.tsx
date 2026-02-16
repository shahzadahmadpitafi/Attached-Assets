import { COMPANY } from "@/lib/constants";
import { SiWhatsapp } from "react-icons/si";
import { useLocation } from "wouter";

export default function WhatsAppButton() {
  const [location] = useLocation();

  if (location.startsWith("/admin")) return null;

  const url = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(COMPANY.whatsappMessage)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg"
      data-testid="button-whatsapp"
      aria-label="Contact us on WhatsApp"
    >
      <SiWhatsapp className="w-7 h-7" />
    </a>
  );
}
