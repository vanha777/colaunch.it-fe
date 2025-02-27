'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Partner() {
  const partners = [
    {
      name: "Solana",
      image: "/solana.png"
    },
    {
      name: "MagicDen", 
      image: "/magicDen.png"
    },
    {
      name: "Metaplex",
      image: "/metaplex.png"
    },
    {
      name: "Hacken",
      image: "/hacken.png"
    }
  ]

  return (
    <section className="relative overflow-hidden py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50" />
      
      {/* Subtle decorative blurs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h2 className="text-sm md:text-base text-center mb-16">
          <span className="text-gray-800">Built on and Partnered with</span>{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Leading Web3 Protocols</span>
        </h2>

        <div className="relative flex overflow-x-hidden">
          <motion.div
            className="flex space-x-16 whitespace-nowrap"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 10,
                ease: "linear",
              },
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="relative w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100"
              >
                <div className="relative w-24 h-24">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-contain transition-all duration-300 hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
