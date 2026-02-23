"use client";

import { X, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AlertData } from "@/contexts/ModalContext";

interface Props {
    variant: "success" | "error";
    data: AlertData;
    onClose: () => void;
}

export default function AlertModal({ variant, data, onClose }: Props) {
    const isSuccess = variant === "success";

    const colors = isSuccess
        ? {
            headerFrom: "from-emerald-500",
            headerTo: "to-emerald-700",
            iconBg: "bg-white/20",
            Icon: CheckCircle,
        }
        : {
            headerFrom: "from-red-500",
            headerTo: "to-red-700",
            iconBg: "bg-white/20",
            Icon: XCircle,
        };

    const { Icon } = colors;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: "scaleIn 0.25s ease both" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div
                    className={`bg-gradient-to-br ${colors.headerFrom} ${colors.headerTo} px-8 pt-10 pb-8 text-white text-center relative overflow-hidden`}
                >
                    <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-white/10 rounded-full" />
                    <div className="relative">
                        <div
                            className={`inline-flex items-center justify-center w-14 h-14 ${colors.iconBg} rounded-full mb-3`}
                            style={{ animation: "scaleIn 0.35s ease both 0.1s" }}
                        >
                            <Icon size={30} className="text-white" />
                        </div>
                        <h2 className="text-xl font-display font-bold">
                            {data?.title ?? (isSuccess ? "Success!" : "Something went wrong")}
                        </h2>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-7 text-center">
                    <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                        {data?.message ?? (isSuccess
                            ? "Your action was completed successfully."
                            : "An unexpected error occurred. Please try again.")}
                    </p>

                    <div className="flex flex-col gap-3">
                        {data?.cta ? (
                            <>
                                <Button asChild className="w-full" onClick={onClose}>
                                    <Link href={data.cta.href}>{data.cta.label}</Link>
                                </Button>
                                <button
                                    onClick={onClose}
                                    className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </>
                        ) : (
                            <Button onClick={onClose} className="w-full">
                                {isSuccess ? "Great, thanks!" : "Try Again"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
