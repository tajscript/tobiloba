"use client";

import { Instagram, Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setMessage("Please enter your email address");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch('/api/suscribe-newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Successfully subscribed! Thank you for joining our newsletter.");
                setEmail("");
            } else {
                setMessage(data.error || "Failed to subscribe. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-accent text-primary">
            <div className="px-5 sm:px-10 flex items-center justify-center flex-col py-24 lg:px-20">
                <h3 className="text-2xl font-semibold mb-5">SUBSCRIBE</h3>
                <p className="text-center">Sign up with your email to get exclusive access to new artwork, <br className="hidden sm:block" />
                    sales, media content, upcoming shows and other updates. </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-5 mt-10">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-72 bg-white p-2 focus:outline-none disabled:opacity-50" 
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="py-2 px-4 bg-primary text-background uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "SIGNING UP..." : "SIGN UP"}
                    </button>
                </form>
                
                {message && (
                    <p className={`mt-4 text-sm text-center ${message.includes('Successfully') ? 'text-secondary' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </div>

            <div className="bg-primary w-full flex items-center justify-center flex-col text-background py-10 px-5 sm:px-10 lg:px-20">
                <div className="flex flex-row gap-5 sm:gap-8 mb-5">
                    <Link href="/"><Instagram className="w-8 h-8 sm:w-10 sm:h-10" /></Link>
                    <Link href="/"><Twitter className="w-8 h-8 sm:w-10 sm:h-10"/></Link>
                    <Link href="/"><Mail className="w-8 h-8 sm:w-10 sm:h-10" /></Link>
                </div>
                <p className="text-sm sm:text-base text-[#626161]">© 2025 Tobi Adetimehin. All rights reserved.</p>
            </div>
        </footer>
    )
}