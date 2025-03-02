'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Partner() {
  const partners = [
    {
      name: "Roman Lobanov",
      image: "/founder2.jpeg"
    },
    {
      name: "Patrick Ha",
      image: "/patrick.jpeg"
    },
    {
      name: "Pranav",
      image: "/founder3.jpeg"
    },
    {
      name: "12K",
      image: "/founder4.jpeg"
    }
  ]

  return (
    <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden py-24">
      {/* Background blurs similar to footer */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400 rounded-full filter blur-[120px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-400 rounded-full filter blur-[120px] opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-gray-800 text-sm md:text-base">Built for and Partnered with</span>{" "}
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-medium text-sm md:text-base">Leading Entrepreneurs</span>
        </motion.h2>

        <div className="relative flex overflow-x-hidden overflow-y-hidden">
          <motion.div
            className="flex space-x-16 whitespace-nowrap"
            initial={{ x: "0%" }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 10,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{
              willChange: "transform",
              transform: "translate3d(0,0,0)",
              WebkitTransform: "translate3d(0,0,0)",
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center"
                style={{
                  WebkitTransform: "translate3d(0,0,0)",
                  transform: "translate3d(0,0,0)",
                }}
              >
                <div className="relative w-32 h-32 flex items-center justify-center bg-transparent rounded-lg hover:shadow-lg transition-all duration-300 p-4">
                  <div className="relative w-24 h-24">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-contain transition-all duration-300 hover:opacity-90"
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-800">{partner.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
