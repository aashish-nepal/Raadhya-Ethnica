"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminAuth, adminLogout } from "@/lib/auth-admin";
import { Button } from "@/components/ui/button";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAdmin, loading, adminData } = useAdminAuth();

    // Redirect to login if not authenticated (except on login page)
    useEffect(() => {
        if (!loading && !isAdmin && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [isAdmin, loading, pathname, router]);

    const handleLogout = async () => {
        await adminLogout();
        router.push("/admin/login");
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    // Don't render admin layout on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Redirect to login if not admin
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-neutral-50">
            <AdminSidebar />
            <div className="flex-1 overflow-auto">
                {/* Admin Header */}
                <div className="bg-white border-b border-neutral-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-medium text-neutral-600">Welcome back,</h2>
                            <p className="text-lg font-semibold text-neutral-900">
                                {adminData?.name || adminData?.email || "Admin"}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Page Content - Wrapped with Error Boundary */}
                <AdminErrorBoundary>
                    {children}
                </AdminErrorBoundary>
            </div>
        </div>
    );
}
