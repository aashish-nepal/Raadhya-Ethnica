"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut, Bell, ExternalLink } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminAuth, adminLogout } from "@/lib/auth-admin";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAdmin, loading, adminData } = useAdminAuth();

    useEffect(() => {
        if (!loading && !isAdmin && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [isAdmin, loading, pathname, router]);

    const handleLogout = async () => {
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
                            <button className="w-9 h-9 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-colors relative">
                                <Bell size={16} className="text-neutral-600" />
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                            </button>

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
                                    onClick={handleLogout}
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
        </div>
    );
}
