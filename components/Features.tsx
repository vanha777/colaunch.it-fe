'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Features() {
  const [cardOrder, setCardOrder] = useState([0, 1, 2])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  const rotateCards = () => {
    setCardOrder(prev => [(prev[1]), (prev[2]), (prev[0])])
  }

  const cards = [
    {
      title: "Simple Player Ownership",
      description: "Let players own in-game items as easily as logging in with Google or Apple—no wallets, no seed phrases, no friction.",
      image: "/login.jpeg"
    },
    {
      title: "One-Click Asset Distribution",
      description: "Create, manage, and distribute game assets with a single dashboard click—or instantly via API in real time.",
      image: "/rewards.jpeg",
    },
    {
      title: "Custom In-game currency",
      description: "Create in-game currencies and rewards from our dashboard—no coding, no databases. Distribute them in real time with a simple API call. Design tokenomics tailored to your game's vision, hassle-free.",
      image: "/tokenomic.jpeg"
    },
    {
      title: "Launch a Branded Marketplace",
      description: "Enable players to buy, sell, and trade items in your very own marketplace—fully branded, seamlessly integrated.",
      image: "/marketplaces.jpeg",
    }
  ];


  return (
    <section className="relative overflow-hidden flex items-center justify-center px-2 md:px-4 text-gray-800 py-24 bg-gray-50">
      <motion.div
        className="w-full relative z-10 px-4 md:px-8 lg:px-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-left my-32">
          <span className="text-gray-800">DESIGNED BY DEVS</span>
          <br className="mb-12" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FOR DEVS</span>
        </h1>
        <div className="flex flex-col gap-48 w-full max-w-7xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 w-full bg-base-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-8`}
            >
              {/* Text Content */}
              <div className="w-full md:w-1/2 text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {card.title}
                </h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Image Display */}
              <div className="w-full md:w-1/2 relative aspect-[4/3]">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    priority
                    loading="eager"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
