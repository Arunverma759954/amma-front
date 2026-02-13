"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaSpinner, FaUser, FaPlane } from "react-icons/fa";
import { supabase } from "@/src/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                // Create profile for tracking
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    is_admin: false
                });
            }

            // Auto-login after signup
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                // If auto-login fails, go to login page normally
                router.push("/login?message=Account created! Please login.");
            } else {
                // Success! Redirect to home
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            console.error("Signup Error:", err);
            setError(err.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
                    alt="Travel Background"
                    className="w-full h-full object-cover opacity-20"
                />
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                        <FaPlane className="text-white text-3xl" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black italic tracking-tighter text-[#071C4B] mb-2">
                        AMADEUS <span className="text-blue-500">TRIP</span>
                    </h1>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Join the Adventure</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold mb-4 border border-red-100 flex items-center gap-2">
                        <span className="text-lg">!</span> {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors"><FaUser /></span>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-bold placeholder-gray-300 shadow-sm"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors"><FaEnvelope /></span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-bold placeholder-gray-300 shadow-sm"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors"><FaLock /></span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 font-bold placeholder-gray-300 shadow-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#071C4B] hover:bg-[#0A2665] text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm uppercase tracking-widest mt-4"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Creating Account...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-500 text-xs font-bold uppercase tracking-wide">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                        Login
                    </Link>
                </div>
                <div className="mt-4 text-center">
                    <Link href="/" className="text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
