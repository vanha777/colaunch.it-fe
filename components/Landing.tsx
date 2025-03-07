'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Landing() {
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  const benefits = [
    {
      title: "Build Unwavering Conviction",
      description: "Our AI agent helps you develop rock-solid belief in your idea before pitching to anyone else.",
      icon: "/icons/validate.svg"
    },
    {
      title: "Focused Direction",
      description: "Channel your energy into one clear direction with superhuman focus and strategic precision.",
      icon: "/icons/collaborate.svg"
    },
    {
      title: "Evidence-Based Validation",
      description: "Build compelling proof of concept with market evidence before investing in development.",
      icon: "/icons/secure.svg"
    }
  ]

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center px-4 md:px-8 py-16 md:py-24">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-400 rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-400 rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-400 rounded-full filter blur-[180px] opacity-20" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.png')] opacity-15"
          style={{ backgroundSize: '50px 50px' }} />
          
        {/* Digital circuit pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)]" 
          style={{ backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gray-900">BUILD FOUNDER</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              CONVICTION
            </span>
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mb-8">
            ConvictionAI is the AI agent that helps founders build unwavering belief in their ideas,
            gather evidence, and validate demand before building their MVP.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-400/20"
            >
              Test Your Idea
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gray-900/80 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700"
            >
              See How It Works
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="relative w-full max-w-5xl mx-auto mb-24"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-4 border border-gray-200">
            {/* AI Agent conversation preview - futuristic UI */}
            <div className="w-full aspect-video bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
              <div className="w-full h-full flex flex-col p-6">
                <div className="flex items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold mr-3 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">AI</div>
                  <div className="bg-white rounded-lg p-3 max-w-[80%] border border-cyan-200 shadow-sm">
                    <p className="text-gray-800">Tell me about your startup idea and I'll help you build evidence-based conviction.</p>
                  </div>
                </div>
                <div className="flex items-start justify-end mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 max-w-[80%] mr-3 border border-blue-200 shadow-sm">
                    <p className="text-gray-800">I want to build a platform that connects local farmers with restaurants.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border border-blue-500/30 shadow-lg shadow-blue-500/20">F</div>
                </div>
                <div className="flex items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold mr-3 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">AI</div>
                  <div className="bg-white rounded-lg p-3 max-w-[80%] border border-cyan-200 shadow-sm">
                    <p className="text-gray-800">Great idea! Let's build your conviction by analyzing the market need, target audience, and potential demand. First, have you identified specific pain points for either farmers or restaurants?</p>
                  </div>
                </div>
                {/* Typing indicator */}
                <div className="flex items-center justify-start">
                  <div className="ml-14 bg-white rounded-3xl px-4 py-2 border border-cyan-200 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Terminal commands flowing in background */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs text-gray-800 whitespace-pre font-mono">
                  &gt; analyzing market trends...<br/>
                  &gt; processing competitor data...<br/>
                  &gt; evaluating pain points...<br/>
                  &gt; generating validation strategy...<br/>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white backdrop-blur-sm p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <img 
                  src={benefit.icon} 
                  alt={benefit.title} 
                  className="w-8 h-8 text-white" 
                />
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Don't miss the "V" in your MVP
            </span>
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8">
            Over 80% of startups fail because they build products nobody wants. 
            ConvictionAI helps you validate before you build.
          </p>
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-24 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200 shadow-sm">
                <span className="text-gray-700 font-medium">Success {i}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}