'use client'

import { useState, useEffect, Suspense } from 'react'
import Satements from '@/components/statements'
import BigStatement from '@/components/BigStatement'
import Hero2 from '@/components/Hero2'
import Demo from '@/components/Demo'
import Features from '@/components/Features'
import NavBar from '@/components/NavBar'
import Partner from '@/components/Partner'
import Starters from '@/components/Starters'
import WhatNew from '@/components/whatNew'
import Footer from '@/components/Footer'
import Landing from '@/components/Landing'
import Head from 'next/head'

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Suspense fallback={<div className="bg-white text-gray-800">Loading...</div>}>
      <main className="bg-white min-h-screen relative text-gray-800">
        <title>ConvictionAI - Build Founder Conviction Before Code</title>
        <NavBar />
        <Landing />
        {/* <Features /> */}
        <Partner />
        {/* <Starters /> */}
        <Footer />
      </main>
    </Suspense>
  )
}