"use client";

import { useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";

const SESSION_KEY = "raadhya_newsletter_dismissed";
const DELAY_MS = 3000;

/**
 * Renders nothing — just auto-triggers the newsletter modal
 * after DELAY_MS on first page visit in a browser session.
 */
export default function NewsletterAutoShow() {
    const { openModal } = useModal();

    useEffect(() => {
        const dismissed = sessionStorage.getItem(SESSION_KEY);
        if (dismissed) return;

        const timer = setTimeout(() => {
            openModal("newsletter");
        }, DELAY_MS);

        return () => clearTimeout(timer);
    }, [openModal]);

    return null;
}
