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
        className="rounded-xl bg-transparent p-2 shadow-lg hover:ring-4 hover:ring-green-200 focus:ring-4 focus:ring-green-300 transition-all flex items-center justify-center"
        style={{ width: 48, height: 48 }}
      >
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width={32} height={32} aria-hidden="true">
          <defs>
            <linearGradient id="wa-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#25D366' }} />
              <stop offset="100%" style={{ stopColor: '#12AF59' }} />
            </linearGradient>
          </defs>
          <path fill="#FFF" d="M417.2 94.8C371.1 48.6 313.2 24 256 24C132.3 24 32 124.3 32 248c0 39.8 10.6 78.1 30.2 112.5L32 488l130.3-34.2c33.5 18.2 70.3 27.7 108.2 27.7h2.8c123.7 0 224-100.3 224-224c0-57.2-24.6-115.1-70.1-161.2z"/>
          <circle cx="256" cy="256" r="176" fill="url(#wa-gradient)"/>
          <g transform="translate(0,-16)">
            <path fill="#FFF" d="M346.7,314.6c-4.8-2.4-28.5-14-33-15.7c-4.4-1.6-7.6-2.4-10.8,2.4c-3.2,4.8-12.5,15.7-15.3,18.9c-2.8,3.2-5.7,3.6-10.5,1.2c-4.8-2.4-20.5-7.6-39-24c-14.4-12.8-24.1-28.5-26.9-33.4c-2.8-4.8-0.3-7.4,2.1-9.7c2.2-2,4.8-5.7,7.2-8.5c2.4-2.8,3.2-4.8,4.8-8.1c1.6-3.2,0.8-6.1-0.4-8.5c-1.2-2.4-10.8-26-14.8-35.6c-4-9.6-8.1-8.2-10.8-8.4c-2.5-0.2-5.7-0.2-8.8-0.2c-3.2,0-8.5,1.2-13,6.1c-4.4,4.8-17,16.5-17,40.1c0,23.6,17.4,46.5,19.8,49.7c2.4,3.2,34.4,52.4,83.4,73.4c11.6,4.9,21.8,8.7,30.1,11.2c15.1,4.4,27.8,3.7,36.5-5.4c9.6-9.9,22.2-28.1,25.3-33.4c3.2-5.3,3.2-9.7,2.1-12.1C354.3,319.4,351.5,318.2,346.7,314.6z"/>
          </g>
        </svg>
      </span>
    </a>
  );
} 