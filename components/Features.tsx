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
      description: "Create in-game currencies and rewards from our dashboard—no coding, no databases. Distribute them in real time with a simple API call. Design tokenomics tailored to your game’s vision, hassle-free.",
      image: "/tokenomic.jpeg"
    },
    {
      title: "Launch a Branded Marketplace",
      description: "Enable players to buy, sell, and trade items in your very own marketplace—fully branded, seamlessly integrated.",
      image: "/marketplaces.jpeg",
    },
    {
      title: "No Database or Expertise Required",
      description: "Leave the complex setup to us—focus on building great games, not managing infrastructure.",
      image: "/zeroknowledge.png",
    },
    {
      title: "True items Ownership",
      description: "Every asset is backed by blockchain, belonging to both studios and players. They can withdraw items or tokens to personal wallets anytime—ensuring genuine ownership and trust.",
      image: "/ownership.jpeg",
    },
  ];


  return (
    <section className="relative overflow-hidden flex items-center justify-center px-2 md:px-4 text-white py-24">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#0f1c3d]">
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#14F195] rounded-full filter blur-[120px] opacity-100" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#9945FF] rounded-full filter blur-[120px] opacity-100" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#14F195] rounded-full filter blur-[150px] opacity-100" />

        {/* Gradient mesh */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0f1c3d]/80 via-[#132552]/75 to-[#1b2f66]/70" /> */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A2F]/90 via-[#0A527A]/80 to-[#0CC0DF]/70" />

        {/* Subtle grid overlay */}
        {/* <div className="absolute inset-0 bg-[url('/grid.png')] opacity-40 bg-repeat bg-center"
          style={{ backgroundSize: '50px 50px' }} /> */}
      </div>

      <motion.div
        className="w-full relative z-10 px-4 md:px-8 lg:px-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-left my-32">
          <span className="text-white">DESIGNED BY DEVS</span>
          <br className="mb-12" />
          <span className="bg-gradient-to-r from-[#0CC0DF] to-[#14F195] bg-clip-text text-transparent">FOR DEVS</span>
        </h1>
        <div className="flex flex-col gap-48 w-full max-w-7xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 w-full`}
            >
              {/* Text Content */}
              <div className="w-full md:w-1/2 text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-[#0CC0DF] to-[#0CC0DF]/70 bg-clip-text text-transparent">
                  {card.title}
                </h2>
                <p className="text-sm md:text-base text-gray-200 leading-relaxed">
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
