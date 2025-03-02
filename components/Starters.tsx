'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Starters() {
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

  const tutorials = [
    {
      title: "Beta Demo",
      description: "This is a 1st demo of the platform.",
      image: "/rewards.jpeg",
      link: "https://example.com/verify-profile"
    }
    // {
    //   title: "Verify Your Profile",
    //   description: "Learn how to complete the verification process for your account. Includes identity verification, connecting social profiles, and security best practices.",
    //   image: "/starter1.jpeg",
    //   link: "https://example.com/verify-profile"
    // },
    // {
    //   title: "Register Your Business or Idea",
    //   description: "Step-by-step guide to registering your business or project idea on our platform. Includes documentation requirements, legal considerations, and visibility settings.",
    //   image: "/starter2.jpg",
    //   link: "https://example.com/register-business"
    // },
    // {
    //   title: "Manage Votes and Shares",
    //   description: "Comprehensive guide on how to create voting proposals, distribute shares, and manage stakeholder participation in your registered projects.",
    //   image: "/starter3.png",
    //   link: "https://example.com/manage-votes"
    // }
  ];

  return (
    <section className="relative overflow-hidden flex items-center justify-center px-2 md:px-4 py-24 bg-white">
      <motion.div
        className="w-full relative z-10 px-4 md:px-8 lg:px-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-left my-32">
          <span className="text-gray-800">QUICK START</span>
          <br className="mb-12" />
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">GUIDES</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tutorials.map((tutorial, index) => (
            <motion.a
              key={index}
              href={tutorial.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              className="bg-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-300 block"
            >
              <div className="relative w-full aspect-video mb-4 rounded-xl overflow-hidden">
                <Image
                  src={tutorial.image}
                  alt={tutorial.title}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {tutorial.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {tutorial.description}
              </p>
            </motion.a>
          ))}
        </div>

        <div className="mt-32 grid grid-cols-1 max-w-7xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-blue-400 shadow-sm flex flex-col items-center justify-center text-center h-fit">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Want to know more?</h3>
            <p className="text-gray-600 mb-6">Join our Discord community! We're happy to answer any questions you might have.</p>
            <a
              href="https://discord.gg/jzUmFtDB3d"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 transition-colors px-8 py-3 rounded-xl font-medium flex items-center gap-2 text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Join Discord
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
