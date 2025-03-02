'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function NavBar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 w-full z-50"
        >
            {/* Background with light theme */}
            <div className="absolute inset-0 bg-white shadow-md">
                {/* Subtle light gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-pink-50/30" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="MetaLoot Logo"
                            width={152}
                            height={152}
                        />
                        {/* <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm hover:scale-105 transition-transform">
                            Co<span className="text-3xl">Launch</span>
                        </span> */}
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <span className="text-xl font-serif italic text-black font-bold">
                            Don't skip the "V" in "MVP"
                        </span>
                        {/* <Link href="about" className="text-gray-700 hover:text-blue-600 transition-colors">
                            About
                        </Link>
                        <Link href="pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Pricing
                        </Link>
                        <Link
                            href="https://documenter.getpostman.com/view/29604463/2sAYQXnsMR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Docs
                        </Link>
                        <Link href="contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Support
                        </Link> */}
                    </div>

                    {/* CTA Button */}
                    <div>
                        <Link
                            href="/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium 
                            hover:from-blue-600 hover:to-purple-600 transition-all duration-300 
                            border border-white/10 shadow-md"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
