"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Bot, Sparkles, TrendingUp, Users, Star, MessageSquare, Palette, Music, Code, ImageIcon, ArrowRight, Play, Crown, FlameIcon as Fire, Rocket, CloudLightningIcon as Lightning } from 'lucide-react'
import { Navigation } from "./navigation"
import { Sidebar } from "./Navbar"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface FeaturedModel {
  id: string
  name: string
  description: string
  category: "ART" | "MUSIC" | "CODE" | "WRITING"
  rating: number
  uses: number
  creator: string
  isPopular: boolean
  color: string
}

const featuredModels: FeaturedModel[] = [
  {
    id: "1",
    name: "CYBER ARTIST PRO",
    description: "CREATES STUNNING DIGITAL ART WITH FUTURISTIC VIBES",
    category: "ART",
    rating: 4.9,
    uses: 15420,
    creator: "DIGITAL_MASTER",
    isPopular: true,
    color: "bg-fuchsia-500",
  },
  {
    id: "2",
    name: "BEAT GENERATOR X",
    description: "PRODUCES ELECTRONIC MUSIC AND SOUND EFFECTS",
    category: "MUSIC",
    rating: 4.7,
    uses: 8930,
    creator: "SOUND_WIZARD",
    isPopular: false,
    color: "bg-purple-500",
  },
  {
    id: "3",
    name: "CODE ARCHITECT",
    description: "GENERATES CLEAN, OPTIMIZED CODE IN MULTIPLE LANGUAGES",
    category: "CODE",
    rating: 4.8,
    uses: 12340,
    creator: "DEV_GENIUS",
    isPopular: true,
    color: "bg-cyan-400",
  },
  {
    id: "4",
    name: "STORY WEAVER AI",
    description: "CRAFTS COMPELLING NARRATIVES AND CREATIVE CONTENT",
    category: "WRITING",
    rating: 4.6,
    uses: 6780,
    creator: "WORD_SMITH",
    isPopular: false,
    color: "bg-lime-400",
  },
]

function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ART":
        return <Palette className="w-5 h-5" />
      case "MUSIC":
        return <Music className="w-5 h-5" />
      case "CODE":
        return <Code className="w-5 h-5" />
      case "WRITING":
        return <Sparkles className="w-5 h-5" />
      default:
        return <Bot className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ART":
        return "bg-fuchsia-500 text-white"
      case "MUSIC":
        return "bg-purple-500 text-white"
      case "CODE":
        return "bg-cyan-400 text-black"
      case "WRITING":
        return "bg-lime-400 text-black"
      default:
        return "bg-gray-300 text-black"
    }
  }

  const navigateToChat = () => {
    router.push("/chat")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-full bg-white/90 backdrop-blur-sm page-container relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-lime-400/20 rounded-full   "></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-fuchsia-500/20 rounded-full animate-brutalist-wiggle"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-cyan-400/20 rounded-full "></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-yellow-400/20 rounded-full   "></div>
      </div>

      <Navigation />
      <div className="pl-10">
      <Sidebar />
</div>
      <div className="max-w-7xl mx-auto p-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Animated title */}
          <div className="mb-8 relative">
   
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 via-fuchsia-500/10 to-cyan-400/10 blur-3xl "></div>
          </div>

          <p className="brutalist-text text-gray-600 max-w-3xl mx-auto text-lg mb-8   ">
            UNLEASH YOUR CREATIVITY WITH CUTTING-EDGE AI MODELS. CREATE, MINT, AND TRADE UNIQUE DIGITAL CONTENT.
          </p>
          
          <Button
            onClick={navigateToChat}
            className="brutalist-button-electric text-xl px-12 py-6 animate-brutalist-bounce group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/0 via-lime-500/30 to-lime-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <MessageSquare className="w-6 h-6 mr-3 group-hover:animate-brutalist-spin relative z-10" />
            <span className="relative z-10">START CREATING NOW</span>
            <Rocket className="w-6 h-6 ml-3 group-hover:animate-brutalist-bounce relative z-10" />
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Fire, value: "50+", label: "CREATIONS", color: "lime-400", delay: "0s" },
            { icon: Users, value: "12+", label: "CREATORS", color: "fuchsia-500", delay: "0.1s" },
            { icon: Bot, value: "5+", label: "AI MODELS", color: "cyan-400", delay: "0.2s" },
            { icon: TrendingUp, value: "89%", label: "SUCCESS RATE", color: "yellow-400", delay: "0.3s" },
          ].map((stat, index) => (
            <Card 
              key={index}
              className={`bg-${stat.color} brutalist-border brutalist-shadow-lg hover:brutalist-shadow-xl transition-all duration-300 interactive-hover group`}
              style={{ animationDelay: stat.delay }}
            >
              <CardContent className="p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 bg-black brutalist-border mx-auto mb-4 flex items-center justify-center brutalist-shadow group-hover:animate-brutalist-spin">
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <p className="text-3xl font-black text-black mb-1 group-hover:animate-brutalist-bounce">{stat.value}</p>
                <p className="brutalist-text text-black text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Models Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 brutalist-border brutalist-shadow-lg flex items-center justify-center ">
                <Crown className="h-8 w-8 text-white animate-brutalist-wiggle" />
              </div>
              <div>
                <h2 className="brutalist-title text-black text-3xl">FEATURED AI MODELS</h2>
                <p className="brutalist-text text-gray-600">TOP-RATED CONTENT GENERATORS</p>
              </div>
            </div>
            <Button className="brutalist-button-cyber group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/0 via-fuchsia-600/30 to-fuchsia-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600"></div>
              <span className="relative z-10">VIEW ALL MODELS</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:animate-brutalist-bounce relative z-10" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredModels.map((model, index) => (
              <Card
                key={model.id}
                className="bg-white brutalist-border brutalist-shadow-lg hover:brutalist-shadow-xl transition-all duration-300 group interactive-hover"
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="p-0">
                  <div className={`${model.color} p-6 brutalist-border-thick relative overflow-hidden`}>
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {model.isPopular && (
                      <Badge className="absolute top-3 right-3 bg-yellow-400 text-black brutalist-border text-xs font-black ">
                        <Fire className="w-3 h-3 mr-1 animate-brutalist-wiggle" />
                        HOT
                      </Badge>
                    )}
                    
                    <div className="w-16 h-16 bg-black brutalist-border mx-auto mb-4 flex items-center justify-center brutalist-shadow group-hover:animate-brutalist-spin relative z-10">
                      {getCategoryIcon(model.category)}
                    </div>
                    <h3 className="brutalist-text text-white text-center text-sm relative z-10 group-hover:animate-brutalist-bounce">
                      {model.name}
                    </h3>
                  </div>
                </CardHeader>

                <CardContent className="p-4 relative">
                  <p className="text-xs text-gray-600 font-bold mb-4 line-clamp-2">{model.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`${getCategoryColor(model.category)} brutalist-border text-xs font-black`}>
                      {model.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current animate-brutalist-wiggle" />
                      <span className="text-xs font-bold">{model.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500">CREATOR</p>
                    <p className="brutalist-text text-black text-xs">{model.creator}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500">USES</p>
                      <p className="brutalist-text text-black text-sm">{model.uses.toLocaleString()}</p>
                    </div>
                    <Button 
                      onClick={navigateToChat} 
                      className={`brutalist-button-electric px-4 py-2 text-xs group relative overflow-hidden ${
                        hoveredModel === model.id ? 'animate-brutalist-bounce' : ''
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-500/0 via-lime-500/30 to-lime-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      <Play className="w-3 h-3 mr-1 group-hover:animate-brutalist-spin relative z-10" />
                      <span className="relative z-10">TRY NOW</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white brutalist-border-thick brutalist-shadow-xl p-8 mb-16 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-lime-400 via-fuchsia-500 to-cyan-400"></div>
          </div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="brutalist-title text-black text-3xl mb-4   ">QUICK ACTIONS</h2>
            <p className="brutalist-text text-gray-600">JUMP INTO CREATION MODE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { icon: ImageIcon, title: "GENERATE IMAGE", subtitle: "CREATE STUNNING VISUALS", color: "brutalist-button-electric" },
              { icon: Music, title: "CREATE MUSIC", subtitle: "COMPOSE ORIGINAL TRACKS", color: "brutalist-button-cyber" },
              { icon: Sparkles, title: "WRITE CONTENT", subtitle: "CRAFT AMAZING STORIES", color: "brutalist-button-danger" },
            ].map((action, index) => (
              <Button 
                key={index}
                onClick={navigateToChat} 
                className={`${action.color} p-8 h-auto flex-col space-y-4 group relative overflow-hidden`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <action.icon className="w-12 h-12 group-hover:animate-brutalist-bounce relative z-10" />
                <div className="relative z-10">
                  <p className="brutalist-text text-lg group-hover:animate-brutalist-wiggle">{action.title}</p>
                  <p className="text-xs font-bold opacity-80">{action.subtitle}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-black brutalist-border-thick brutalist-shadow-xl p-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-8 h-8 bg-lime-400 rounded-full   "></div>
            <div className="absolute top-4 right-4 w-6 h-6 bg-fuchsia-500 rounded-full animate-brutalist-wiggle"></div>
            <div className="absolute bottom-4 left-1/3 w-10 h-10 bg-cyan-400 rounded-full "></div>
            <div className="absolute bottom-4 right-1/4 w-7 h-7 bg-yellow-400 rounded-full animate-brutalist-bounce"></div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-6 relative z-10">
            <div className="w-16 h-16 bg-lime-400 brutalist-border flex items-center justify-center brutalist-shadow animate-brutalist-shake">
              <Zap className="h-8 w-8 text-black animate-brutalist-wiggle" />
            </div>
            <h2 className="brutalist-title text-white text-4xl   ">READY TO CREATE?</h2>
            <div className="w-16 h-16 bg-fuchsia-500 brutalist-border flex items-center justify-center brutalist-shadow animate-brutalist-shake">
              <Bot className="h-8 w-8 text-white animate-brutalist-bounce" />
            </div>
          </div>
          
          <p className="brutalist-text text-lime-400 text-xl mb-8  relative z-10">
            JOIN THOUSANDS OF CREATORS MAKING AMAZING CONTENT WITH AI
          </p>
          
          <Button
            onClick={navigateToChat}
            className="brutalist-button-electric text-2xl px-16 py-8 animate-brutalist-bounce group relative overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/0 via-lime-500/40 to-lime-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-800"></div>
            <MessageSquare className="w-8 h-8 mr-4 group-hover:animate-brutalist-spin relative z-10" />
            <span className="relative z-10">START YOUR JOURNEY</span>
            <Lightning className="w-8 h-8 ml-4 group-hover:animate-brutalist-bounce relative z-10" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
