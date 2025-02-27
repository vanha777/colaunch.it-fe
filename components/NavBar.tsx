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
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
                
                {/* Subtle blur effect */}
                <div className="absolute inset-0 backdrop-blur-md" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/transLogo.png"
                            alt="MetaLoot Logo"
                            width={32}
                            height={32}
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            MetaLoot
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="about" className="text-gray-300 hover:text-blue-400 transition-colors">
                            About
                        </Link>
                        <Link href="pricing" className="text-gray-300 hover:text-blue-400 transition-colors">
                            Pricing
                        </Link>
                        <Link
                            href="https://documenter.getpostman.com/view/29604463/2sAYQXnsMR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-blue-400 transition-colors"
                        >
                            Docs
                        </Link>
                        <Link href="contact" className="text-gray-300 hover:text-blue-400 transition-colors">
                            Support
                        </Link>
                    </div>

                    {/* CTA Button */}
                    <div>
                        <Link
                            href="/signup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium 
                            hover:from-blue-600 hover:to-purple-600 transition-all duration-300 
                            border border-white/10 shadow-lg"
                        >
                            Beta Access
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
