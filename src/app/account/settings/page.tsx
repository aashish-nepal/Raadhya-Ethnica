"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { User as FirebaseUser } from "firebase/auth";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Profile fields
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            setDisplayName(user.displayName || "");
            setEmail(user.email || "");

            try {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setPhone((profile as any).phone || "");
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        }

        if (user) {
            loadProfile();
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            // Update display name in Firebase Auth
            if (displayName !== user.displayName) {
                await updateProfile(user as FirebaseUser, { displayName });
            }

            // Update phone in Firestore
            await updateUserProfile(user.uid, { phone });

            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !currentPassword) {
            setMessage({ type: "error", text: "Please enter your current password" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user as FirebaseUser, credential);

            // Update email
            await updateEmail(user as FirebaseUser, email);

            setMessage({ type: "success", text: "Email updated successfully!" });
            setCurrentPassword("");
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to update email" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user as FirebaseUser, credential);

            // Update password
            await updatePassword(user as FirebaseUser, newPassword);

            setMessage({ type: "success", text: "Password updated successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to update password" });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container-custom py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-display font-bold mb-8">Account Settings</h1>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <User size={24} />
                        Profile Information
                    </h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Display Name</label>
                            <Input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+61 XXX XXX XXX"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            <Save size={18} className="mr-2" />
                            Save Profile
                        </Button>
                    </form>
                </div>

                {/* Email Settings */}
                <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Mail size={24} />
                        Email Address
                    </h2>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">New Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password to confirm"
                            />
                        </div>
                        <Button type="submit" disabled={loading || email === user.email}>
                            <Save size={18} className="mr-2" />
                            Update Email
                        </Button>
                    </form>
                </div>

                {/* Password Settings */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Lock size={24} />
                        Change Password
                    </h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            <Save size={18} className="mr-2" />
                            Update Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
