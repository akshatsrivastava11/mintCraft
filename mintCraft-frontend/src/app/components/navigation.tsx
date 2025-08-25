//@ts-nocheck
"use client"
import { Button } from "@/components/ui/button"
import useAppstore from "@/state/state"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { trpc } from "../clients/trpc"
import { Wallet, Home, Bot, ShoppingBag, Square, Zap, Sparkles } from 'lucide-react'
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export function Navigation() {
  const { connect, select, publicKey, sendTransaction, disconnect } = useWallet()
  const router = useRouter()
  const pathname = usePathname()
  const [isConnecting, setIsConnecting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { wallet } = useAppstore()

  const connectWalletMutation = trpc.authRouter.connectWallet.useMutation({
    onSuccess(data) {
      console.log("wallet connected", data)
      setIsConnecting(false)
    },
    onError(error) {
      console.log("Error connecting wallet:", error)
      setIsConnecting(false)
    },
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      console.log("Connecting wallet ...")
      await select("Phantom")
      await connect()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setIsConnecting(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    wallet.isConnected = true
    wallet.address = publicKey
    wallet.balance = 0
    console.log("Publickey is ", publicKey?.toString())
    if (publicKey) {
      ;(async () => {
        console.log("Publickey is before mutation ", publicKey)
        const response = await connectWalletMutation.mutate({ walletAddress: publicKey?.toString() })
        console.log("Publickey is after mutation ", publicKey)
        console.log("REsponse i s", response)
      })()
    }
  }, [publicKey])

  const hanldeDisconnect = async () => {
    await disconnect()
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { path: "/home", label: "HOME", icon: Home, color: "lime-400" },
    { path: "/chat", label: "CHAT", icon: Bot, color: "fuchsia-500" },
    { path: "/developers", label: "AGENTS", icon: Sparkles, color: "cyan-400" },
    { path: "/marketplace", label: "MARKET", icon: ShoppingBag, color: "yellow-400" },
  ]

  if (!mounted) {
    return null
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm brutalist-border-thick brutalist-shadow-xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-lime-400 rounded-full   "></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500 rounded-full animate-brutalist-wiggle"></div>
        <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-cyan-400 rounded-full "></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-black brutalist-border flex items-center justify-center brutalist-shadow group-hover:animate-brutalist-spin transition-all duration-300">
                <Square className="w-6 h-6 text-lime-400 fill-current" />
              </div>
              <h1 className="brutalist-title text-black group-hover:text-fuchsia-500 transition-colors duration-300">
                MINTCRAFT
              </h1>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button 
                      className={`
                        nav-item relative overflow-hidden
                        ${active 
                          ? `brutalist-button-electric  bg-${item.color}` 
                          : "brutalist-button hover:brutalist-shadow-lg"
                        }
                        group
                      `}
                    >
                      {/* Animated background for active state */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-brutalist-shimmer"></div>
                      )}
                      
                      <Icon className={`w-5 h-5 mr-2 transition-all duration-300 ${
                        active ? "animate-brutalist-bounce" : "group-hover:scale-110"
                      }`} />
                      
                      <span className="relative z-10">{item.label}</span>
                      
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-400/0 via-lime-400/20 to-lime-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {publicKey && (
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-lime-400 brutalist-border brutalist-shadow   ">
                <div className="w-3 h-3 bg-black  rounded-full"></div>
                <span className="brutalist-text text-black text-sm">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </span>
                <Zap className="w-4 h-4 text-black animate-brutalist-wiggle" />
              </div>
            )}

            {/* Wallet Button */}
            {publicKey ? (
              <Button 
                className="brutalist-button-danger group relative overflow-hidden" 
                onClick={hanldeDisconnect}
                disabled={isConnecting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/30 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Wallet className="w-5 h-5 mr-2 group-hover:animate-brutalist-shake relative z-10" />
                <span className="relative z-10">DISCONNECT</span>
              </Button>
            ) : (
              <Button 
                className="brutalist-button-electric group relative overflow-hidden " 
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/0 via-lime-500/30 to-lime-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600"></div>
                
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin relative z-10"></div>
                    <span className="relative z-10">CONNECTING...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2 group-hover:animate-brutalist-bounce relative z-10" />
                    <span className="relative z-10">CONNECT WALLET</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link key={item.path} href={item.path} className="flex-1 min-w-[120px]">
                <Button 
                  className={`
                    w-full nav-item
                    ${active 
                      ? `brutalist-button-electric bg-${item.color}` 
                      : "brutalist-button"
                    }
                  `}
                  size="sm"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom border animation */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 via-fuchsia-500 to-cyan-400 animate-brutalist-shimmer"></div>
    </nav>
  )
}
