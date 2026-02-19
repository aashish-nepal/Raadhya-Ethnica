"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
    onClose: () => void;
    /** Where to navigate after a successful LOGIN (e.g. "/checkout") */
    redirectAfterLogin?: string;
    /** Where to navigate after a successful REGISTER.
     *  Defaults to "/account/addresses?redirect=checkout" */
    redirectAfterRegister?: string;
}

export default function AuthModal({
    onClose,
    redirectAfterLogin = "/checkout",
    redirectAfterRegister = "/account/addresses?redirect=checkout",
}: AuthModalProps) {
    const router = useRouter();
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const [tab, setTab] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register state
    const [regData, setRegData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signIn(loginEmail, loginPassword);
            onClose();
            router.push(redirectAfterLogin);
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithGoogle();
            onClose();
            router.push(redirectAfterLogin);
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (regData.password !== regData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (regData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await signUp(regData.email, regData.password, regData.name);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                router.push(redirectAfterRegister);
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 pt-8 pb-6 text-white">
                    <h2 className="text-2xl font-display font-bold">
                        {tab === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">
                        {tab === "login"
                            ? "Sign in to continue to checkout"
                            : "Join Raadhya Ethnica to complete your order"}
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-5 bg-primary-700/50 rounded-lg p-1">
                        <button
                            onClick={() => { setTab("login"); setError(""); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "login"
                                ? "bg-white text-primary-700 shadow"
                                : "text-primary-100 hover:text-white"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setTab("register"); setError(""); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "register"
                                ? "bg-white text-primary-700 shadow"
                                : "text-primary-100 hover:text-white"
                                }`}
                        >
                            Create Account
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6">
                    {/* Success state (register only) */}
                    {success && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle size={28} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">Account Created!</h3>
                            <p className="text-neutral-500 text-sm">Redirecting you to add your address…</p>
                        </div>
                    )}

                    {!success && (
                        <>
                            {/* Error */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {/* LOGIN FORM */}
                            {tab === "login" && (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                            <Input
                                                type="email"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                            <Input
                                                type="password"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Signing in…" : "Sign In"}
                                    </Button>

                                    <div className="relative my-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-neutral-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white text-neutral-400">Or continue with</span>
                                        </div>
                                    </div>

                                    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Sign in with Google
                                    </Button>
                                </form>
                            )}

                            {/* REGISTER FORM */}
                            {tab === "register" && (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                            <Input
                                                type="text"
                                                value={regData.name}
                                                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                            <Input
                                                type="email"
                                                value={regData.email}
                                                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                                placeholder="you@example.com"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                                <Input
                                                    type="password"
                                                    value={regData.password}
                                                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Confirm</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                                <Input
                                                    type="password"
                                                    value={regData.confirmPassword}
                                                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <label className="flex items-start gap-2 text-sm text-neutral-600">
                                        <input type="checkbox" className="mt-0.5 rounded" required />
                                        <span>
                                            I agree to the{" "}
                                            <Link href="/terms" className="text-primary-600 hover:underline" target="_blank">Terms</Link>
                                            {" "}and{" "}
                                            <Link href="/privacy" className="text-primary-600 hover:underline" target="_blank">Privacy Policy</Link>
                                        </span>
                                    </label>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Creating account…" : "Create Account"}
                                    </Button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
