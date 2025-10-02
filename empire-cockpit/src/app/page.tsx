'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, Trophy, Target, TrendingUp, ShoppingBag, Video,
  Scale, Shield, Zap, Star, ChevronRight, Play,
  Users, Award, CheckCircle, Clock
} from 'lucide-react'
import type { User, Mission, Product, Episode } from '@/types'

export default function HeroPage() {
  const [user, setUser] = useState<User | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [latestEpisode, setLatestEpisode] = useState<Episode | null>(null)
  const [xpProgress, setXpProgress] = useState(0)

  // Calculate XP to next level
  const getXpToNextLevel = (level: number) => level * 100
  const getXpProgress = (xp: number, level: number) => {
    const required = getXpToNextLevel(level)
    const current = xp % required
    return (current / required) * 100
  }

  useEffect(() => {
    // TODO: Fetch user data from API
    // TODO: Fetch active missions
    // TODO: Fetch featured products
    // TODO: Fetch latest HNC episode
  }, [])

  return (
    <div className="min-h-screen">
      {/* Starfield Background */}
      <div className="starfield" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="text-hemp-gradient">Grow</span>,{' '}
              <span className="text-liberty-gradient">Sell</span>,{' '}
              <span className="text-texas-gradient">Heal</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-4xl md:text-6xl">
              <Leaf className="text-hemp-500 animate-float" />
              <Scale className="text-liberty-500 animate-float" style={{ animationDelay: '0.2s' }} />
              <Shield className="text-texas-blue animate-float" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto"
          >
            The AI cockpit for legal cannabis freedom. Gamified commerce, policy tools, and Herbitrage Greeks—all in one Texas-powered platform.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            {[
              { icon: Shield, label: 'DSHS #690' },
              { icon: CheckCircle, label: 'NIST Verified' },
              { icon: Award, label: '21+ Only' },
              { icon: Star, label: 'Veteran Owned' },
            ].map((badge, i) => (
              <div
                key={i}
                className="glass px-6 py-3 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                <badge.icon className="w-5 h-5 text-hemp-500" />
                <span className="font-semibold text-sm">{badge.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
              <Leaf className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Enter the Wall of Weed
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 group">
              <Video className="w-6 h-6" />
              Watch High Noon Cartoon
              <Play className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Dashboard Tiles Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* XP & Level Tile */}
            <div className="glass p-6 rounded-2xl hover:bg-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-liberty-500" />
                  <h3 className="text-xl font-bold">Your Progress</h3>
                </div>
                <div className="px-3 py-1 bg-hemp-500 rounded-full text-sm font-bold">
                  Level {user?.level || 1}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>{user?.xp || 0} XP</span>
                  <span>{getXpToNextLevel(user?.level || 1)} XP</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getXpProgress(user?.xp || 0, user?.level || 1)}%` }}
                    className="h-full bg-gradient-to-r from-hemp-400 to-hemp-600 xp-bar-glow"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold rank-${user?.rank?.toLowerCase() || 'seedling'}`}>
                  {user?.rank || 'SEEDLING'}
                </div>
              </div>
            </div>

            {/* Today's Mission Tile */}
            <div className="mission-card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-liberty-500" />
                <h3 className="text-xl font-bold">Today's Mission</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-hemp-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Watch HNC Episode #47</p>
                    <p className="text-sm text-slate-400">+25 XP</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Scale className="w-5 h-5 text-liberty-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Sign SB3 Public Comment</p>
                    <p className="text-sm text-slate-400">+50 XP</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 btn-primary text-sm">
                Complete Missions →
              </button>
            </div>

            {/* Wall of Weed Fast Lane */}
            <div className="product-card">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-6 h-6 text-hemp-500" />
                  <h3 className="text-xl font-bold">Fast Lane</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blue Dream Pre-Roll</span>
                    <span className="font-bold">$12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wall Bundle 3.5g</span>
                    <span className="font-bold">$35</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">COA-Verified Mix</span>
                    <span className="font-bold">$65</span>
                  </div>
                </div>

                <button className="w-full btn-texas text-sm">
                  <ShoppingBag className="w-4 h-4 inline mr-2" />
                  Shop Now
                </button>
              </div>
            </div>

            {/* Herbitrage Greeks Tile (VIP Feature) */}
            <div className="glass p-6 rounded-2xl border-2 border-liberty-500/50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-liberty-500" />
                <h3 className="text-xl font-bold">Herbitrage Greeks</h3>
                <div className="px-2 py-0.5 bg-liberty-500 text-xs font-bold rounded">VIP</div>
              </div>

              <div className="space-y-2 mono text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">ROI/day:</span>
                  <span className="text-hemp-500 font-bold">$147</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delta (Δ):</span>
                  <span className="text-blue-400">+2.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Theta (Θ):</span>
                  <span className="text-red-400">-0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gamma (Γ):</span>
                  <span className="text-purple-400">+1.1%</span>
                </div>
              </div>

              <button className="w-full mt-4 btn-secondary text-sm">
                View Analytics →
              </button>
            </div>

            {/* High Noon Shoutouts Tile */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-6 h-6 text-hemp-500" />
                <h3 className="text-xl font-bold">Wall Shoutouts</h3>
              </div>

              <div className="space-y-3">
                {['@TexasToker47', '@AustinGreen', '@HTownFarmer'].map((user, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Star className="w-4 h-4 text-liberty-500" />
                    <span className="text-hemp-500 font-semibold">{user}</span>
                    <span className="text-slate-400">just leveled up!</span>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 btn-primary text-sm">
                Join the Wall →
              </button>
            </div>

            {/* Latest HNC Episode */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-6 h-6 text-hemp-500" />
                <h3 className="text-xl font-bold">Latest Episode</h3>
              </div>

              <div className="aspect-video bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-75" />
              </div>

              <p className="font-semibold mb-1">HNC Ep.47: The Freedom Farmer</p>
              <p className="text-sm text-slate-400 mb-3">Watch time: 8:42 | +25 XP</p>

              <button className="w-full btn-primary text-sm">
                <Play className="w-4 h-4 inline mr-2" />
                Watch Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="py-12 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Active Users', value: '12,847', icon: Users },
              { label: 'Total XP Earned', value: '2.4M', icon: Trophy },
              { label: 'Missions Complete', value: '47,392', icon: CheckCircle },
              { label: 'Orders Fulfilled', value: '8,901', icon: ShoppingBag },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-xl"
              >
                <stat.icon className="w-8 h-8 text-hemp-500 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Optimized: 2025-10-02
