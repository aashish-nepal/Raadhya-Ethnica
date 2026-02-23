"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, ExternalLink } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminAuth, adminLogout } from "@/lib/auth-admin";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAdmin, loading, adminData } = useAdminAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [isAdmin, loading, pathname, router]);

    const handleLogout = async () => {
        setLoggingOut(true);
        await adminLogout();
        router.push("/admin/login");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    <p className="text-sm text-neutral-400 font-medium">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!isAdmin) {
        return null;
    }

    const adminInitial = (adminData?.name || adminData?.email || "A")[0].toUpperCase();

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <AdminSidebar />
            <div className="flex-1 overflow-auto min-w-0">
                {/* Premium Top Bar */}
                <div className="sticky top-0 z-40 bg-white border-b border-neutral-100 px-8 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Admin Panel</p>
                            <h1 className="text-base font-semibold text-neutral-900">Welcome back, {adminData?.name || "Admin"}</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notification bell */}
                            <AdminNotificationBell />

                            {/* Visit store */}
                            <Link href="/" target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors">
                                <ExternalLink size={13} />
                                Store
                            </Link>

                            {/* Admin avatar + logout */}
                            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 ml-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {adminInitial}
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-xs font-semibold text-neutral-900 leading-none">{adminData?.name || adminData?.email?.split("@")[0]}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">Administrator</p>
                                </div>
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="p-2 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors ml-1"
                                    title="Sign Out"
                                >
                                    <LogOut size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <AdminErrorBoundary>
                    {children}
                </AdminErrorBoundary>
            </div>

            {/* ── Logout Confirmation Modal ─────────────────────────────── */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                    onClick={() => { if (!loggingOut) setShowLogoutModal(false); }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon + text */}
                        <div className="flex flex-col items-center pt-8 pb-4 px-6">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <LogOut size={26} className="text-red-500" />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900 text-center">Sign out of Admin Panel?</h2>
                            <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
                                You will be redirected to the login page. Any unsaved changes will be lost.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 pb-6 pt-2">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                disabled={loggingOut}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loggingOut ? (
                                    <><Loader2 size={15} className="animate-spin" /> Signing out…</>
                                ) : (
                                    <><LogOut size={15} /> Sign Out</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
