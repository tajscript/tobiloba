'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AlignLeft, X, ShoppingCart, ChevronDown, Instagram, Twitter, Mail } from 'lucide-react';
import CartIcon from '@/components/CartIcon';
import logoPng from "@/public/asset/logo.png"
import Image from 'next/image';

export default function Header() {
    // State for mobile navigation
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // State for painting dropdown
    const [paintingsDropdownOpen, setPaintingsDropdownOpen] = useState(false);
    const [mobilePaintingsOpen, setMobilePaintingsOpen] = useState(false);

    // Ref for the paintings dropdown element (desktop)
    const paintingsDropdownRef = useRef<HTMLDivElement>(null);

    // Toggle mobile navigation
    const toggleMobileNav = () => {
        setMobileNavOpen(!mobileNavOpen);
        // Close paintings dropdown when toggling mobile nav
        setMobilePaintingsOpen(false);
        console.log('Mobile nav toggled');
    };

    // Toggle painting dropdown on mobile
    const toggleMobilePaintings = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMobilePaintingsOpen(!mobilePaintingsOpen);
    };

    // Close mobile nav when clicking on a link
    const handleLinkClick = () => {
        setMobileNavOpen(false);
        setMobilePaintingsOpen(false);
    };

    // Handle click outside to close the desktop dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (paintingsDropdownRef.current && !paintingsDropdownRef.current.contains(event.target as Node)) {
                setPaintingsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="h-20 sm:h-32 max-w-[1536px] mx-auto sm:flex flex-col sm:gap-4 w-full text-primary relative">
            <div className="flex justify-between items-center px-5 sm:px-10 lg:px-20 h-full sm:h-auto">
                <div className="hidden sm:block">Login</div>
                <button
                    className="sm:hidden text-primary cursor-pointer"
                    onClick={toggleMobileNav}
                    aria-label="Open navigation menu"
                >
                    <AlignLeft />
                </button>

                <Link href="/" className="w-32 sm:w-44">
                    <Image src={logoPng} alt=""></Image>
                </Link>

                <button className="flex flex-row items-center gap-2 text-primary">
                    <CartIcon className="text-white" size={24} />
                </button>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden sm:flex items-center gap-10 mx-auto">
                <Link href="/" className="duration-500 transition-all ease-in-out hover:underline">HOME</Link>
                <Link href="/about" className="duration-500 transition-all ease-in-out hover:underline">ABOUT</Link>

                {/* Desktop Paintings Dropdown */}
                <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setPaintingsDropdownOpen(true)}
                    onMouseLeave={() => setPaintingsDropdownOpen(false)}
                    ref={paintingsDropdownRef}
                >
                    <div className="flex items-center gap-1">
                        PAINTINGS
                        <ChevronDown className="w-4 h-4" />
                    </div>

                    {/* Paintings dropdown content */}
                    {paintingsDropdownOpen && (
                        <div className="absolute bg-white shadow-md py-3 px-4 z-10 min-w-40 flex flex-col gap-2">
                            <Link
                                href="/narrative"
                                className="whitespace-nowrap hover:text-secondary transition-colors"
                            >
                                Narrative paintings
                            </Link>
                            <Link
                                href="/portraits"
                                className="whitespace-nowrap hover:text-secondary transition-colors"
                            >
                                Portraits
                            </Link>
                            <Link
                                href="/studies"
                                className="whitespace-nowrap hover:text-secondary transition-colors"
                            >
                                Studies
                            </Link>
                        </div>
                    )}
                </div>

                <Link href="/shop" className="duration-500 transition-all ease-in-out hover:underline">SHOP</Link>
                <Link href="/contact" className="duration-500 transition-all ease-in-out hover:underline">CONTACT</Link>
            </nav>

            {/* Mobile Nav */}
            <nav className={`sm:hidden flex flex-col fixed inset-0 h-screen w-screen bg-primary text-background z-50 overflow-y-auto transition-all duration-300 ${mobileNavOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="flex justify-between pt-10 px-5">
                    <button>Login</button>
                    <button
                        onClick={toggleMobileNav}
                        aria-label="Close navigation menu"
                    >
                        <X />
                    </button>
                </div>

                <div className="flex flex-col gap-10 items-center pt-40">
                    <Link href="/" onClick={handleLinkClick}>HOME</Link>
                    <Link href="/about" onClick={handleLinkClick}>ABOUT</Link>

                    {/* Mobile Paintings Dropdown */}
                    <div className="flex flex-col items-center">
                        <div
                            className="flex flex-row items-center cursor-pointer"
                            onClick={toggleMobilePaintings}
                        >
                            PAINTINGS <ChevronDown className={`ml-1 transition-transform ${mobilePaintingsOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {mobilePaintingsOpen && (
                            <div className="flex flex-col gap-3 mt-3 items-center">
                                <Link href="/narrative" onClick={handleLinkClick}>Narrative paintings</Link>
                                <Link href="/portraits" onClick={handleLinkClick}>Portraits</Link>
                                <Link href="/studies" onClick={handleLinkClick}>Studies</Link>
                            </div>
                        )}
                    </div>

                    <Link href="/contact" onClick={handleLinkClick}>CONTACT</Link>
                    <Link href="/shop" onClick={handleLinkClick} className="border border-secondary text-secondary px-8 py-1.5 rounded-full">SHOP</Link>

                    <div className="flex flex-row gap-5 mt-10">
                        <Link href="/" onClick={handleLinkClick}><Instagram /></Link>
                        <Link href="/" onClick={handleLinkClick}><Twitter /></Link>
                        <Link href="/" onClick={handleLinkClick}><Mail /></Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}