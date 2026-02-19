"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919876543210";
    const message = encodeURIComponent("Hi! I'm interested in your kurtas collection.");
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={24} />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Chat with us!
            </span>
        </a>
    );
}
