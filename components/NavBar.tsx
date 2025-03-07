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
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-purple-50/40 to-cyan-50/40" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm hover:scale-105 transition-transform flex items-center">
                            <div className="mr-2 w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs">
                                AI
                            </div>
                            Conviction<span className="text-3xl">AI</span>
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <span className="text-xl font-serif italic text-blue-600 font-medium">
                            Conviction before code
                        </span>
                        <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
                            How It Works
                        </Link>
                        <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Pricing
                        </Link>
                    </div>

                    {/* CTA Button */}
                    <div>
                        <Link
                            href="/dashboard"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium 
                            hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 
                            border border-cyan-400/20 shadow-md shadow-cyan-500/10"
                        >
                            Try For Free
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}