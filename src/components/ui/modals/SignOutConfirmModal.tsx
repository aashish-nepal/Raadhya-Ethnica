"use client";

import { X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
}

export default function SignOutConfirmModal({ onConfirm, onClose }: Props) {
    const handleConfirm = async () => {
        onClose();
        await onConfirm();
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "scaleIn 0.22s ease both" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-700 transition-colors"
                    aria-label="Cancel sign out"
                >
                    <X size={20} />
                </button>

                {/* Icon header */}
                <div className="flex flex-col items-center pt-10 pb-5 px-8">
                    <div
                        className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4"
                        style={{ animation: "scaleIn 0.3s ease both 0.1s" }}
                    >
                        <LogOut size={28} className="text-red-500" />
                    </div>

                    <h2 className="text-xl font-display font-bold text-neutral-900 text-center">
                        Sign Out?
                    </h2>
                    <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
                        You'll be signed out of your account. Your cart and wishlist will be saved for next time.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex flex-col gap-3">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Yes, Sign Me Out
                    </button>
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Cancel, Stay Signed In
                    </Button>
                </div>
            </div>
        </div>
    );
}
