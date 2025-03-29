"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
    business: {
        name: string;
        image: string;
        logo: string;
        rating: number;
        reviewCount: number;
        description: string;
    } | null;
}

const HeroSection = ({ business }: HeroSectionProps) => (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${business?.image})` }}
        />

        {/* Business Info Container */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-4 md:p-8">
            {/* Logo Container */}
            <div className="mb-2 md:mb-4">
                <img
                    src={business?.logo}
                    alt={business?.name}
                    className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white shadow-lg"
                />
            </div>

            {/* Business Name */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-center text-white"
            >
                {business?.name}
            </motion.h1>

            {/* Rating and Reviews */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-2 md:mb-4"
            >
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-base md:text-xl">
                            {i < Math.floor(business?.rating || 0) ? "★" : "☆"}
                        </span>
                    ))}
                </div>
                <span className="text-white text-sm md:text-base">
                    {business?.rating} ({business?.reviewCount} reviews)
                </span>
            </motion.div>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base lg:text-lg text-center max-w-2xl text-white"
            >
                {business?.description}
            </motion.p>
        </div>
    </div>
);

export default HeroSection;
