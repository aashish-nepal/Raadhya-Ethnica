"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ShoppingBag, X, CheckCheck, ExternalLink } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import Link from "next/link";

function timeAgo(timestamp: any): string {
    if (!timestamp) return "";
    let ms: number;
    if (typeof timestamp.toMillis === "function") ms = timestamp.toMillis();
    else if (typeof timestamp === "string") ms = new Date(timestamp).getTime();
    else ms = 0;

    const diff = Date.now() - ms;
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function AdminNotificationBell() {
    const { notifications, unreadCount, markAllRead } = useAdminNotifications();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Show only the 20 most recent notifications
    const visibleNotifications = notifications.slice(0, 20);
    const unreadOnes = visibleNotifications.filter((n) => !n.isRead);
    const readOnes = visibleNotifications.filter((n) => n.isRead);

    return (
        <div className="relative" ref={containerRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-colors relative"
                title="Order notifications"
            >
                <Bell size={16} className={`transition-colors ${unreadCount > 0 ? "text-primary-600" : "text-neutral-600"}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={15} className="text-primary-600" />
                            <p className="text-sm font-semibold text-neutral-900">New Orders</p>
                            {unreadCount > 0 && (
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50"
                                >
                                    <CheckCheck size={13} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg hover:bg-neutral-200 transition-colors ml-1"
                            >
                                <X size={14} className="text-neutral-400" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-neutral-50">
                        {visibleNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                                    <Bell size={20} className="text-neutral-400" />
                                </div>
                                <p className="text-sm font-medium text-neutral-600">No orders yet</p>
                                <p className="text-xs text-neutral-400 mt-1">New orders will appear here</p>
                            </div>
                        ) : (
                            <>
                                {/* Unread */}
                                {unreadOnes.map((n) => (
                                    <Link
                                        key={n.id}
                                        href="/admin/orders"
                                        onClick={() => setOpen(false)}
                                        className="flex items-start gap-3 px-4 py-3 bg-primary-50/40 hover:bg-primary-50 transition-colors group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                                            {n.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-xs font-semibold text-neutral-900 truncate">
                                                        {n.customerName}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                                        {n.orderNumber}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-bold text-neutral-900">
                                                        ${n.total.toFixed(2)}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                                        {timeAgo(n.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-primary-600 font-medium mt-1">
                                                🛍️ {n.itemCount} item{n.itemCount !== 1 ? "s" : ""} ordered
                                            </p>
                                        </div>
                                        {/* Unread dot */}
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0 animate-pulse" />
                                    </Link>
                                ))}

                                {/* Read */}
                                {readOnes.map((n) => (
                                    <Link
                                        key={n.id}
                                        href="/admin/orders"
                                        onClick={() => setOpen(false)}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors opacity-60 group"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-sm font-bold shrink-0">
                                            {n.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-xs font-medium text-neutral-700 truncate">
                                                        {n.customerName}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                                        {n.orderNumber}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-semibold text-neutral-700">
                                                        ${n.total.toFixed(2)}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                                        {timeAgo(n.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/40">
                        <Link
                            href="/admin/orders"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            View all orders
                            <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
