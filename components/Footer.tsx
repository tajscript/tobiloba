import { Instagram, Mail, Twitter } from "lucide-react";
import Link from "next/link";


export default async function Footer() {

    return (
        <footer className="bg-accent text-primary">
            <div className="px-5 sm:px-10 flex items-center justify-center flex-col py-24 lg:px-20">
            <h3 className="text-2xl font-semibold mb-5">SUBSCRIBE</h3>
            <p className="text-center">Sign up with your email to get exclusive access to new artwork, <br className="hidden sm:block" />
                sales, media content, upcoming shows and other updates. </p>

            <form className="flex flex-col sm:flex-row gap-5 mt-10">
                <input type="email" placeholder="Email Address" className="w-72 bg-white p-2 focus:outline-none" />
                <button type="submit" className="py-2 px-4 bg-primary text-background uppercase cursor-pointer">SIGN UP</button>
            </form>
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