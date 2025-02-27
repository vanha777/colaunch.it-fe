'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Starters() {
  const [isMobile, setIsMobile] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

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
      title: "Quick Start Guide",
      description: "Get up and running in 5 minutes with our basic starter template. Includes wallet integration, token transfers, and basic NFT display.",
      steps: [
        "Clone the repository",
        "Install dependencies",
        "Configure environment variables",
        "Run the development server"
      ],
      image: "/starter1.jpeg"
    },
    {
      title: "Create your own first items",
      description: "Create your own NFT marketplace with our comprehensive starter kit. Includes minting, listing, and trading functionality.",
      steps: [
        "Set up smart contracts",
        "Configure marketplace parameters",
        "Implement frontend components",
        "Deploy to mainnet"
      ],
      image: "/starter2.jpg"
    },
    {
      title: "Distribute your items",
      description: "Learn how to implement token gating for exclusive content and features in your dApp.",
      steps: [
        "Install token gating package",
        "Set up authentication",
        "Configure access rules",
        "Test gated content"
      ],
      image: "/starter3.png"
    }
  ];

  const faqs = [
    {
      question: "How do I get started with MetaLoot?",
      answer: "Start by following our Quick Start Guide which walks you through the basic setup process. You'll need to have Node.js installed and basic knowledge of React."
    },
    {
      question: "What blockchain networks do you support?",
      answer: "We currently support Solana mainnet and devnet. Support for additional networks is coming soon."
    },
    {
      question: "How can I integrate MetaLoot into my existing project?",
      answer: "Our SDK provides easy-to-use hooks and components that can be imported directly into your existing React/Next.js application."
    }
  ];

  return (
    <section className="relative overflow-hidden flex items-center justify-center px-2 md:px-4 py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Abstract background elements */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500 rounded-full filter blur-[120px] opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full filter blur-[120px] opacity-10" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-400 rounded-full filter blur-[150px] opacity-10" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20"
            style={{ backgroundSize: '50px 50px' }} />
      </div>

      <motion.div
        className="w-full relative z-10 px-4 md:px-8 lg:px-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-left my-32">
          <span className="text-white">QUICK START</span>
          <br className="mb-12" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GUIDES</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="relative w-full aspect-video mb-4 rounded-xl overflow-hidden">
                <Image
                  src={tutorial.image}
                  alt={tutorial.title}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {tutorial.title}
              </h3>

              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                {tutorial.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-400">Quick Steps:</h4>
                {tutorial.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-blue-400">→</span>
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-8 text-white">Frequently Asked Questions</h2>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border-b border-white/10"
                initial={false}
              >
                <button
                  className="w-full py-4 flex justify-between items-center text-left text-white hover:text-blue-400 transition-colors"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↓
                  </motion.span>
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: openFAQ === index ? "auto" : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-gray-300">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center h-fit">
            <h3 className="text-2xl font-bold mb-4 text-white">Want to know more?</h3>
            <p className="text-gray-300 mb-6">Join our Discord community! We're happy to answer any questions you might have.</p>
            <a
              href="https://discord.com/invite/U7WJBdCtjv"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 transition-colors px-8 py-3 rounded-xl font-medium flex items-center gap-2"
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
