"use client";

import { X, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    email: string;
    onClose: () => void;
}

export default function PasswordResetModal({ email, onClose }: Props) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "scaleIn 0.25s ease both" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-700 transition-colors"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                {/* Gradient header */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 pt-10 pb-8 text-white text-center">
                    {/* Animated mail icon */}
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                        style={{ animation: "float 3s ease-in-out infinite" }}
                    >
                        <Mail size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold">Check Your Inbox!</h2>
                    <p className="text-primary-100 text-sm mt-1">
                        Password reset link sent
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 py-7 text-center">
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                        <p className="text-sm text-neutral-600">
                            We've sent a reset link to{" "}
                            <span className="font-semibold text-neutral-900 break-all">{email}</span>
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-left mb-6">
                        <p className="text-sm text-amber-800 font-medium mb-1">📬 Didn't receive it?</p>
                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                            <li>Check your spam or junk folder</li>
                            <li>The link expires in 1 hour</li>
                            <li>Make sure the email address is correct</li>
                        </ul>
                    </div>

                    <Button onClick={onClose} className="w-full">
                        Back to Sign In
                    </Button>

                    <p className="text-xs text-neutral-400 mt-4">
                        Sent from{" "}
                        <span className="text-primary-600">noreply@raadhyaethnica.com.au</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
