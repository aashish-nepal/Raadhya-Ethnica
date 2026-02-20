"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { adminLogin, useAdminAuth } from "@/lib/auth-admin";
import { validateEmail } from "@/lib/admin-utils";

export default function AdminLoginPage() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAdminAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in as admin — but first ensure session cookie is set
    useEffect(() => {
        if (!authLoading && isAdmin) {
            // useAdminAuth already called /api/auth/session, so we can navigate safely
            router.push("/admin");
        }
    }, [isAdmin, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate email format
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const result = await adminLogin(email, password);

            if (result.success) {
                router.push("/admin");
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Raadhya Admin</h1>
                    <p className="text-neutral-400">Sign in to access the admin panel</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle size={20} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@raadhyaethnica.com"
                                    className="pl-10"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Admin Access Required</p>
                        <p className="text-xs text-blue-700">
                            Only users with admin privileges can access this panel. Contact your administrator if you need access.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
