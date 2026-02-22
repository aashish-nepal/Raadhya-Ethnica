"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseAuthError } from "@/lib/firebase-errors";
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

function ForgotPasswordContent() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await resetPassword(email);
            setSent(true);
        } catch (err: any) {
            setError(getFirebaseAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check your email</h2>
                    <p className="text-neutral-600 mb-6">
                        We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
                    </p>
                    <p className="text-sm text-neutral-500 mb-6">
                        Didn&apos;t receive it? Check your spam folder or{" "}
                        <button
                            onClick={() => setSent(false)}
                            className="text-primary-600 hover:text-primary-700 font-medium underline"
                        >
                            try again
                        </button>
                        .
                    </p>
                    <Link href="/auth/login">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
                        Reset Password
                    </h1>
                    <p className="text-neutral-600">Enter your email and we&apos;ll send you a reset link</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
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
                                    placeholder="you@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
