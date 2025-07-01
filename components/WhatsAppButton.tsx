import React from "react";

const WHATSAPP_NUMBER = "27648360876"; // South Africa country code +27
const DEFAULT_MESSAGE = encodeURIComponent("Hi! I'm interested in your plants.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 flex items-center justify-center transition-all"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
    >
      <span className="sr-only">Chat with us on WhatsApp</span>
      <span
        className="rounded-xl bg-[#25D366] p-2 shadow-lg hover:ring-4 hover:ring-green-200 focus:ring-4 focus:ring-green-300 transition-all flex items-center justify-center"
        style={{ width: 48, height: 48 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={32}
          height={32}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M19.11 17.47c-.26-.13-1.54-.76-1.78-.85-.24-.09-.4-.13-.56.13-.17.26-.65.85-.8 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.27-.77-.68-1.29-1.51-1.44-1.77-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.47.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.13-.62-1.51-.85-2.07-.22-.56-.44-.48-.59-.49-.15-.01-.32-.01-.5-.01-.18 0-.47.07-.72.36-.25.29-.92.97-.92 2.46 0 1.49 1.04 2.93 1.19 3.14.15.21 2.06 3.21 4.99 4.33.7.24 1.25.38 1.67.48.7.16 1.34.14 1.86.09.57-.07 1.77-.71 2-.14.23-.57.23-1.06.17-1.18-.06-.12-.26-.19-.55-.32z"
            fill="#fff"
          />
        </svg>
      </span>
    </a>
  );
} 