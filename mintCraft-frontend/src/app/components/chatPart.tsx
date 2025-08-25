"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Bot, User, Zap, ChevronDown, Download, ExternalLink, AlertCircle, CheckCircle, Coins, Hash, Wallet, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { trpc } from "../clients/trpc"
import useAppstore from "@/state/state"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { showToast } from "@/lib/toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Toaster } from "react-hot-toast"

// Enhanced interfaces with better typing
interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
  imageUrl?: string | null
  contentType?: "text" | "image"
  status?: "sending" | "success" | "error"
  nftMinted?: boolean
  contentId?: number
  showMintButton?: boolean
  mintingInProgress?: boolean
  nft_mint_address?: string
  listingInProgress?: boolean
  showListButton?: boolean
  transactionSignature?: string // Added for tracking transaction signatures
  mintTransactionSignature?: string // Added for tracking mint transaction signatures
  istxLabelContentGeneration?: boolean
  istxLabelMintAddress?: boolean
  istxLabelNftMintingTransaction?: boolean
  istxLabelNftListing?: boolean
}

interface AIModel {
  id: number
  ownerId: number
  name: string
  description: string
  royaltyPercentage: number
  apiEndpoint: string
  headersJSONstring: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  aiModelPublicKey: string
  owner: {
    wallet: string
    id: number
  }
}

type GetAllModelsResponse = AIModel[] | undefined

interface OperationState {
  isProcessing: boolean
  currentStep: string
  error: string | null
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary:", error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center h-full bg-white backdrop-blur-sm p-8">
          <Card className="bg-red-500 brutalist-border-thick brutalist-shadow-xl max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-black brutalist-border mx-auto mb-6 flex items-center justify-center brutalist-shadow">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="brutalist-title text-white text-2xl mb-4">APPLICATION ERROR!</h2>
              <p className="brutalist-text text-white text-sm mb-6">
                {this.state.error?.message || "Something went wrong. Please reload the page."}
              </p>
              <Button onClick={() => window.location.reload()} className="brutalist-button-electric w-full">
                RELOAD PAGE
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}

// Safe Image Component
const SafeImage: React.FC<{
  src?: string | null
  alt: string
  className?: string
  onError?: () => void
}> = ({ src, alt, className, onError, ...props }) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const validSrc = useMemo(() => {
    if (!src) return null
    try {
      new URL(src)
      return src
    } catch {
      console.error("Invalid image URL:", src)
      return null
    }
  }, [src])

  const handleError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)
    onError?.()
  }, [onError])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (!validSrc || imageError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center min-h-48`}>
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <span className="brutalist-text text-gray-600 text-sm">Image failed to load</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      <img
        src={validSrc || "/placeholder.svg"}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

// Copy to clipboard utility
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text).then(() => {
    showToast.success(`${label} copied to clipboard!`)
  }).catch(() => {
    showToast.error(`Failed to copy ${label}`)
  })
}

// Transaction/Address display component
const TransactionTag: React.FC<{
  type: "mint" | "transaction"
  value: string
  label?: string
  className?: string
}> = ({ type, value, label, className = "" }) => {
  const truncatedValue = `${value.slice(0, 10)}...${value.slice(-4)}`
  const bgColor = type === "mint" ? "bg-purple-500" : "bg-cyan-500"
  const icon = type === "mint" ? <Wallet className="w-3 h-3 text-white" /> : <Hash className="w-3 h-3 text-white" />
  const defaultLabel = type === "mint" ? "MINT" : "TXN"
  const displayLabel = label || defaultLabel

  return (
    <div 
      className={`flex items-center space-x-1 px-3 py-1 ${bgColor} brutalist-border cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={() => copyToClipboard(value, type === "mint" ? "Mint address" : "Transaction signature")}
      title={`Click to copy ${type === "mint" ? "mint address" : "transaction signature"}`}
    >
      {icon}
      <span className="brutalist-text text-white text-xs font-bold">{displayLabel}</span>
      <span className="brutalist-text text-white text-xs">{truncatedValue}</span>
      <Copy className="w-3 h-3 text-white opacity-60" />
    </div>
  )
}

// Debounced input hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function ChatPart() {
  const connection = useConnection()
  const { data, error, isLoading: modelsLoading } = trpc.aiModelRouter.getAll.useQuery()
  const { signTransaction, sendTransaction, publicKey, connected } = useWallet()
  const { signingTransaction } = useAppstore()
  const [price, setPrice] = useState(0)

  // Enhanced state management
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [operationState, setOperationState] = useState<OperationState>({
    isProcessing: false,
    currentStep: "",
    error: null,
  })
  const [selectedAImodel, setSelectedAImodel] = useState<number | null>(null)
  const [allModels, setAllModels] = useState<GetAllModelsResponse>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Refs for cleanup and toast management
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentToastRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced message for preventing spam
  const debouncedMessage = useDebounce(newMessage, 300)

  // Toast management utilities
  const showLoadingToast = useCallback((message: string) => {
    if (currentToastRef.current) {
      showToast.dismiss(currentToastRef.current)
    }
    currentToastRef.current = showToast.loading(message)
    return currentToastRef.current
  }, [])

  const dismissCurrentToast = useCallback(() => {
    if (currentToastRef.current) {
      showToast.dismiss(currentToastRef.current)
      currentToastRef.current = null
    }
  }, [])

  // Safe async operation wrapper
  const safeAsyncOperation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      errorMessage: string,
      onError?: (error: Error) => void,
    ): Promise<T | null> => {
      try {
        return await operation()
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        console.error(errorMessage, errorObj)
        showToast.error(errorObj.message || errorMessage)
        onError?.(errorObj)
        return null
      }
    },
    [],
  )

  // Validation utilities
  const validateWalletConnection = useCallback(() => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected")
    }
  }, [connected, publicKey])

  const validateModelSelection = useCallback(() => {
    if (!selectedAImodel) {
      throw new Error("No AI model selected")
    }
    const model = allModels?.find((m) => m.id === selectedAImodel)
    if (!model) {
      throw new Error("Selected model not found")
    }
    return model
  }, [selectedAImodel, allModels])

  const validateInput = useCallback((input: string) => {
    if (!input.trim()) {
      throw new Error("Please enter a message")
    }
    if (input.length > 500) {
      throw new Error("Message too long (max 500 characters)")
    }
  }, [])

  // Mutations with enhanced error handling
  const initializeUserConfig = trpc.contentRouter.initilizeUserConfig.useMutation({
    onSuccess: (data) => {
      console.log("User config initialized", data)
    },
    onError: (error) => {
      console.error("Error initializing user config:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to initialize user config" }))
      showToast.error("Failed to initialize user config")
      setConnectionError("Failed to initialize user configuration")
    },
  })

  const initializeUserConfigForMarketplace = trpc.marketplaceRouter.initilizeUserConfig.useMutation({
    onSuccess: (data) => {
      console.log("User config for marketplace initialized", data)
    },
    onError: (error) => {
      console.error("Error initializing user config for marketplace:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to initialize user config for marketplace" }))
      showToast.error("Failed to initialize user config for marketplace")
      setConnectionError("Failed to initialize user configuration for marketplace")
    },
  })

  const contentGenerationMutation = trpc.contentRouter.generate.useMutation({
    onSuccess: (data) => {
      console.log("Content generation response:", data)
    },
    onError: (error) => {
      console.error("Error generating content:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to generate content" }))
      showToast.error("Failed to generate content")
    },
  })

  const confirmcontentGeneration = trpc.contentRouter.confirmContentSubmission.useMutation({
    onSuccess: (data) => {
      console.log("Content generation confirmed:", data)
      showToast.success("Content generated successfully!")
    },
    onError: (error) => {
      console.error("Error confirming content:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to confirm content generation" }))
      showToast.error("Failed to confirm content generation")
    },
  })

  const mintingNftMutation = trpc.contentRouter.mintAsNft.useMutation({
    onSuccess: (data) => {
      console.log("NFT minting initiated:", data)
    },
    onError: (error) => {
      console.error("Error minting NFT:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to mint NFT" }))
      showToast.error("Failed to mint NFT")
    },
  })

  const confirmMintingNft = trpc.contentRouter.confirmNFTSubmission.useMutation({
    onSuccess: (data) => {
      console.log("NFT minting confirmed:", data)
    },
    onError: (error) => {
      console.error("Error confirming NFT:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to confirm NFT minting" }))
      showToast.error("Failed to confirm NFT minting")
    },
  })

  const NFTListing = trpc.marketplaceRouter.listNft.useMutation({
    onSuccess: (data) => {
      console.log("NFT listing confirmed:", data)
    },
    onError: (error) => {
      console.error("Error confirming NFT:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to confirm NFT listing" }))
      showToast.error("Failed to confirm NFT listing ")
    },
  })

  const confirmNftListing = trpc.marketplaceRouter.confirmListing.useMutation({
    onSuccess: (data) => {
      console.log("NFT minting confirmed:", data)
    },
    onError: (error) => {
      console.error("Error confirming NFT:", error)
      setOperationState((prev) => ({ ...prev, error: "Failed to confirm NFT minting" }))
      showToast.error("Failed to confirm NFT minting")
    },
  })

  // Enhanced message status updater
  const updateMessageStatus = useCallback(
    (messageId: string, status: Message["status"], updates?: Partial<Message>) => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status, ...updates } : msg)))
    },
    [],
  )

  // Auto-scroll with error handling
  const scrollToBottom = useCallback(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch (error) {
      console.warn("Failed to scroll to bottom:", error)
    }
  }, [])

  // Enhanced NFT minting for specific content
  const mintContentAsNFT = useCallback(
    async (contentId: number, messageId: string) => {
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        setOperationState({ isProcessing: true, currentStep: "Minting NFT", error: null })
        updateMessageStatus(messageId, "sending", {
          mintingInProgress: true,
          showMintButton: false,
        })

        const loadingToast = showLoadingToast("Minting NFT...")

        const nftMintedResponse = await safeAsyncOperation(
          () =>
            mintingNftMutation.mutateAsync({
              contentId: contentId,
              name: "AI Generated NFT",
              royaltyPercentage: 3,
              symbol: "AIGENNFT",
            }),
          "NFT minting failed",
        )

        if (!nftMintedResponse?.success) {
          throw new Error("NFT minting failed")
        }

        dismissCurrentToast()
        const signingToast = showLoadingToast("Please sign the NFT minting transaction...")

        const nftSignature: string | null = await safeAsyncOperation(
          () =>
            signingTransaction(
              signTransaction,
              sendTransaction,
              connection,
              nftMintedResponse.serializedTransaction,
              publicKey?.toString(),
            ),
          "NFT transaction signing failed",
        )

        if (!nftSignature) {
          throw new Error("NFT transaction signing failed")
        }

        dismissCurrentToast()
        const confirmingToast = showLoadingToast("Confirming NFT minting...")

        const confirmNftResponse = await safeAsyncOperation(
          () =>
            confirmMintingNft.mutateAsync({
              transactionSignature: nftSignature,
              pendingNftId: nftMintedResponse.pendingNftId,
            }),
          "NFT confirmation failed",
        )

        if (!confirmNftResponse?.success) {
          throw new Error("NFT confirmation failed")
        }

        console.log("&&&&&&&&&&&&&", confirmNftResponse.nft.mintAddress)
        updateMessageStatus(messageId, "success", {
          nftMinted: true,
          mintingInProgress: false,
          showMintButton: false,
          nft_mint_address: confirmNftResponse.nft.mintAddress,
          mintTransactionSignature: nftSignature, // Store mint transaction signature
          showListButton: true,
          istxLabelMintAddress: true, // Add this flag
          istxLabelNftMintingTransaction: true, // Add this flag
        })

        const successMessage: Message = {
          id: Date.now().toString(),
          content: "🎉 SUCCESS! Your image has been minted as an NFT!",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          contentType: "text",
          status: "success",
        }
        setMessages((prev) => [...prev, successMessage])

        const suggestionMessage: Message = {
          id: (Date.now() + 2).toString(),
          content:
            "Your image is minted as NFT ! Click the 'List on Marketplace' button below the image if you want to list it on the marketplace! 🚀",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          contentType: "text",
          status: "success",
        }
        setMessages((prev) => [...prev, suggestionMessage])

        dismissCurrentToast()
        showToast.success("🎉 NFT minted successfully!")
      } catch (error: any) {
        console.error("Error minting NFT:", error)
        updateMessageStatus(messageId, "error", {
          mintingInProgress: false,
          showMintButton: true, // Show button again on error
        })
        showToast.error(error.message || "Failed to mint NFT")
      } finally {
        setOperationState({ isProcessing: false, currentStep: "", error: null })
        dismissCurrentToast()
        abortControllerRef.current = null
      }
    },
    [
      mintingNftMutation,
      confirmMintingNft,
      signingTransaction,
      signTransaction,
      sendTransaction,
      connection,
      publicKey,
      updateMessageStatus,
      showLoadingToast,
      dismissCurrentToast,
      safeAsyncOperation,
    ],
  )

  const ListNFTOnMarketplace = useCallback(
    async (nft_mint_address: string, messageId: string) => {
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      try {
        setOperationState((prev) => ({ ...prev, currentStep: "Initializing user config for the marketplace" }))
        let loadingToast = showLoadingToast("Initializing marketplace user configuration...")

        const response1 = await safeAsyncOperation(
          () => initializeUserConfigForMarketplace.mutateAsync(),
          "Failed to initialize user config",
        )

        if (!response1) throw new Error("User config initialization failed")

        if (response1.alreadyExists) {
          dismissCurrentToast()
          showToast.success("User configuration ready!")
        } else if (response1.serializedTransaction) {
          dismissCurrentToast()
          loadingToast = showLoadingToast("Please sign the initialization transaction...")

          const responseSigned1 = await safeAsyncOperation(
            () =>
              signingTransaction(
                signTransaction,
                sendTransaction,
                connection,
                response1.serializedTransaction,
                publicKey?.toString(),
              ),
            "Initialization transaction signing failed",
          )

          if (!responseSigned1) throw new Error("Initialization transaction signing failed")
          dismissCurrentToast()
        }

        setOperationState({ isProcessing: true, currentStep: "Listing NFT On the Marketplace", error: null })
        updateMessageStatus(messageId, "sending", {
          listingInProgress: true,
          showListButton: false,
        })

        loadingToast = showLoadingToast("Listing NFT...")

        const nftMintedResponse = await safeAsyncOperation(
          () =>
            NFTListing.mutateAsync({
              marketplaceId: 1, //TODO//FIND THE MARKETPLACE FIRST
              nft_mint_address: nft_mint_address,
              price: 1000, // Example price, adjust as needed
            }),
          "NFT Listing failed",
        )

        if (!nftMintedResponse?.success) {
          throw new Error("NFT minting failed")
        }

        dismissCurrentToast()
        const signingToast = showLoadingToast("Please sign the NFT listing transaction...")

        const nftSignature: string | any = await safeAsyncOperation(
          () =>
            signingTransaction(
              signTransaction,
              sendTransaction,
              connection,
              nftMintedResponse.serializedTransaction,
              publicKey?.toString(),
            ),
          "NFT listing transaction signing failed",
        )

        if (!nftSignature) {
          throw new Error("NFT transaction signing failed")
        }

        dismissCurrentToast()
        const confirmingToast = showLoadingToast("Confirming NFT listing...")

        const confirmNftResponse = await safeAsyncOperation(
          () =>
            confirmNftListing.mutateAsync({
              transactionSignature: nftSignature,
              pendingListId: nftMintedResponse.pendingListId,
            }),
          "NFT listing confirmation failed",
        )

        if (!confirmNftResponse?.success) {
          throw new Error("NFT confirmation failed")
        }
        setOperationState({ isProcessing: false, currentStep: "", error: null })
        updateMessageStatus(messageId, "success", {
          nftMinted: true,
          mintingInProgress: false,
          showMintButton: false,
          transactionSignature: nftSignature,
          istxLabelNftListing: true, // Add this flag
        })

        const successMessage: Message = {
          id: Date.now().toString(),
          content: "🎉 SUCCESS! Your NFT has been listed over the marketplace!",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          contentType: "text",
          status: "success",
        }
        setMessages((prev) => [...prev, successMessage])

        dismissCurrentToast()
        showToast.success("🎉 NFT listed successfully!")
      } catch (error: any) {
        console.error("Error listing NFT:", error)
        updateMessageStatus(messageId, "error", {
          listingInProgress: false,
          showListButton: true, // Show button again on error
        })
        showToast.error(error.message || "Failed to list NFT")
      }
    },
    [
      mintingNftMutation,
      confirmMintingNft,
      signingTransaction,
      signTransaction,
      sendTransaction,
      connection,
      publicKey,
      updateMessageStatus,
      showLoadingToast,
      dismissCurrentToast,
      safeAsyncOperation,
    ],
  )

  // Enhanced main message handler (removed automatic NFT detection)
  const handleSendMessage = useCallback(async () => {
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      // Validation
      validateInput(newMessage)
      validateWalletConnection()
      const aiModelUsed = validateModelSelection()

      setOperationState({ isProcessing: true, currentStep: "Initializing", error: null })
      setConnectionError(null)

      const userMessageId = Date.now().toString()
      const aiMessageId = (Date.now() + 1).toString()

      // Add messages to UI
      const userMessage: Message = {
        id: userMessageId,
        content: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        contentType: "text",
        status: "success",
      }

      const aiMessage: Message = {
        id: aiMessageId,
        content: "Generating your content...",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        contentType: "text",
        status: "sending",
      }

      setMessages((prev) => [...prev, userMessage, aiMessage])
      const currentPrompt = newMessage
      setNewMessage("")

      // Step 1: Initialize user config
      setOperationState((prev) => ({ ...prev, currentStep: "Initializing user config" }))
      let loadingToast = showLoadingToast("Initializing user configuration...")

      const response1 = await safeAsyncOperation(
        () => initializeUserConfig.mutateAsync(),
        "Failed to initialize user config",
      )

      if (!response1) throw new Error("User config initialization failed")

      if (response1.alreadyExists) {
        dismissCurrentToast()
        showToast.success("User configuration ready!")
      } else if (response1.serializedTransaction) {
        dismissCurrentToast()
        loadingToast = showLoadingToast("Please sign the initialization transaction...")

        const responseSigned1 = await safeAsyncOperation(
          () =>
            signingTransaction(
              signTransaction,
              sendTransaction,
              connection,
              response1.serializedTransaction,
              publicKey?.toString(),
            ),
          "Initialization transaction signing failed",
        )

        if (!responseSigned1) throw new Error("Initialization transaction signing failed")
        dismissCurrentToast()
      }

      // Step 2: Generate content
      setOperationState((prev) => ({ ...prev, currentStep: "Generating content" }))
      updateMessageStatus(aiMessageId, "sending", { content: "Generating your image..." })
      loadingToast = showLoadingToast("Generating content with AI...")

      const response = await safeAsyncOperation(
        () =>
          contentGenerationMutation.mutateAsync({
            aiModelId: aiModelUsed.id,
            prompt: currentPrompt,
            contentType: "image",
            description: "AI Generated Image",
            name: "AI Generated Content",
          }),
        "Content generation failed",
      )

      if (!response?.success) throw new Error("Content generation failed")

      // Step 3: Sign content generation transaction
      setOperationState((prev) => ({ ...prev, currentStep: "Signing transaction" }))
      updateMessageStatus(aiMessageId, "sending", { content: "Please sign the content generation transaction..." })
      dismissCurrentToast()
      loadingToast = showLoadingToast("Please sign the transaction...")

      const sig: string | null = await safeAsyncOperation(
        () =>
          signingTransaction(
            signTransaction,
            sendTransaction,
            connection,
            response.serializedTransaction,
            publicKey?.toString(),
          ),
        "Transaction signing failed",
      )

      if (!sig) throw new Error("Transaction signing failed")

      // Step 4: Confirm content generation
      setOperationState((prev) => ({ ...prev, currentStep: "Confirming generation" }))
      updateMessageStatus(aiMessageId, "sending", { content: "Confirming content generation..." })

      const confirmResponse = await safeAsyncOperation(
        () =>
          confirmcontentGeneration.mutateAsync({
            transactionSignature: sig,
            pendingContentId: response.pendingContentId,
          }),
        "Content confirmation failed",
      )

      if (!confirmResponse?.success) throw new Error("Content confirmation failed")

      dismissCurrentToast()
      showToast.success("Content generated successfully!")

      if (!(typeof response.contentUri == "string")) {
        throw new Error("Invalid content URI received")
      }

      // Step 5: Update message with generated image and show mint button
      updateMessageStatus(aiMessageId, "success", {
        content: "Here's your generated image!",
        imageUrl: response.contentUri,
        contentType: "image",
        contentId: confirmResponse.content.id,
        showMintButton: true, // Show the mint button
        nftMinted: false,
        mintingInProgress: false,
        transactionSignature: sig, // Store content generation transaction signature
        istxLabelContentGeneration: true, // Add this flag
      })

      // Add suggestion message
      const suggestionMessage: Message = {
        id: (Date.now() + 2).toString(),
        content:
          "Your image is ready! Click the 'Mint as NFT' button below the image if you want to turn it into an NFT! 🚀",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        contentType: "text",
        status: "success",
      }
      setMessages((prev) => [...prev, suggestionMessage])
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error)
      const aiMessageId = messages[messages.length - 1]?.id
      if (aiMessageId) {
        updateMessageStatus(aiMessageId, "error", {
          content: `Error: ${error.message || "Something went wrong. Please try again."}`,
        })
      }
      showToast.error(error.message || "Failed to process your request")
      setConnectionError(error.message || "An unexpected error occurred")
    } finally {
      setOperationState({ isProcessing: false, currentStep: "", error: null })
      dismissCurrentToast()
      abortControllerRef.current = null
    }
  }, [
    newMessage,
    messages,
    validateInput,
    validateWalletConnection,
    validateModelSelection,
    initializeUserConfig,
    contentGenerationMutation,
    confirmcontentGeneration,
    signingTransaction,
    signTransaction,
    sendTransaction,
    connection,
    publicKey,
    updateMessageStatus,
    showLoadingToast,
    dismissCurrentToast,
    safeAsyncOperation,
  ])

  // Enhanced key press handler
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !operationState.isProcessing) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage, operationState.isProcessing],
  )

  // Enhanced download handler
  const handleDownload = useCallback((imageUrl: string, messageId: string) => {
    try {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `ai-generated-${messageId}.png`
      link.click()
      showToast.success("Download started!")
    } catch (error) {
      console.error("Download failed:", error)
      showToast.error("Download failed")
    }
  }, [])

  // Initialize models data with error handling
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setAllModels(data)
      if (data.length > 0 && !selectedAImodel) {
        setSelectedAImodel(data[0].id)
      }
    }
  }, [data, selectedAImodel])

  // Handle API errors
  useEffect(() => {
    if (error) {
      console.error("Error loading models:", error)
      showToast.error("Failed to load AI models")
      setConnectionError("Unable to connect to AI models service")
    }
  }, [error])

  // Auto-scroll effect
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Welcome message effect
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "YO! I'M YOUR AI ASSISTANT. READY TO CREATE SOME SICK CONTENT? Generate an image first, then you can mint it as an NFT using the button that appears below the image!",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      contentType: "text",
      status: "success",
    }
    setMessages([welcomeMessage])
  }, [])

  // Cleanup effect
  useEffect(() => {
    return () => {
      dismissCurrentToast()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      setOperationState({ isProcessing: false, currentStep: "", error: null })
    }
  }, [dismissCurrentToast])

  // Memoized selected model
  const selectedModel = useMemo(
    () => allModels?.find((model) => model.id === selectedAImodel),
    [allModels, selectedAImodel],
  )

  // Loading state for models
  if (modelsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white backdrop-blur-sm">
        <LoadingSpinner size="lg" text="LOADING AI MODELS..." />
      </div>
    )
  }

  // Error state for models
  if (connectionError && !allModels?.length) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-white backdrop-blur-sm p-8">
        <Card className="bg-red-500 brutalist-border-thick brutalist-shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-black brutalist-border mx-auto mb-6 flex items-center justify-center brutalist-shadow">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="brutalist-title text-white text-2xl mb-4">CONNECTION ERROR!</h2>
            <p className="brutalist-text text-white text-sm mb-6">{connectionError}</p>
            <Button onClick={() => window.location.reload()} className="brutalist-button-electric w-full">
              RETRY CONNECTION
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary onError={(error) => console.error("Chat component error:", error)}>
      <div className="flex-1 flex flex-col h-full bg-white backdrop-blur-sm">
        <Toaster />

        {/* Chat Header */}
        <div className="bg-white brutalist-border-thick brutalist-shadow py-4 px-6 pl-50 ml-300 mt-1 mr-10">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="brutalist-button-cyber px-2 right-10" disabled={operationState.isProcessing}>
                  <Bot className="w-4 h-4 mr-2" />
                  {selectedModel ? selectedModel.name : "SELECT MODEL"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-gray-500 brutalist-border brutalist-shadow">
                <DropdownMenuLabel className="brutalist-text text-black p-4">CHOOSE AI MODEL</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={selectedAImodel?.toString()}
                    onValueChange={(val) => setSelectedAImodel(Number(val))}
                  >
                    {allModels &&
                      allModels.map((model) => (
                        <DropdownMenuRadioItem
                          key={model.id}
                          value={String(model.id)}
                          className="hover:bg-lime-400 p-4 brutalist-text"
                          disabled={operationState.isProcessing}
                        >
                          <div className="flex flex-col">
                            <span className="font-black text-black">{model.name}</span>
                            <span className="text-xs text-gray-600 font-bold">{model.description}</span>
                            <span className="text-xs text-gray-500 font-bold">Royalty: {model.royaltyPercentage}%</span>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              {connected ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-lime-400 brutalist-border">
                  <CheckCircle className="w-4 h-4 text-black" />
                  <span className="brutalist-text text-black text-xs">CONNECTED</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500 brutalist-border">
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span className="brutalist-text text-white text-xs">DISCONNECTED</span>
                </div>
              )}

              {/* Operation Status */}
              {operationState.isProcessing && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-400 brutalist-border">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span className="brutalist-text text-black text-xs">{operationState.currentStep}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="bg-red-500 brutalist-border-thick p-4 mx-6 mt-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-white" />
              <p className="brutalist-text text-white text-sm">{connectionError}</p>
              <Button
                onClick={() => setConnectionError(null)}
                className="ml-auto text-white hover:text-gray-200"
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/80 backdrop-blur-sm">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-lime-400 brutalist-border brutalist-shadow-xl mx-auto mb-6 flex items-center justify-center">
                  <Zap className="h-12 w-12 text-black" />
                </div>
                <h3 className="brutalist-title text-black mb-4">START CREATING</h3>
                <p className="brutalist-text text-gray-600 max-w-md">
                  SEND A MESSAGE TO BEGIN YOUR AI-POWERED CONTENT CREATION
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-12 h-12 bg-fuchsia-500 brutalist-border flex items-center justify-center flex-shrink-0 brutalist-shadow">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                )}

                <div className="flex  max-w-[75%]">
                  <Card
                    className={`brutalist-border ${
                      message.sender === "user"
                        ? "bg-black text-white brutalist-shadow-electric"
                        : message.status === "error"
                          ? "bg-red-500 text-white brutalist-shadow-danger"
                          : message.status === "sending"
                            ? "bg-yellow-400 text-black brutalist-shadow-warning"
                            : "bg-white text-black brutalist-shadow-cyber"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-bold leading-relaxed flex-1">{message.content}</p>
                        {/* Status indicator */}
                        {message.status === "sending" && (
                          <Loader2 className="w-4 h-4 animate-spin ml-2 flex-shrink-0" />
                        )}
                        {message.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-white ml-2 flex-shrink-0" />
                        )}
                        {message.nftMinted && <CheckCircle className="w-4 h-4 text-lime-400 ml-2 flex-shrink-0" />}
                      </div>

                      {/* Display image if it's an AI response with an image */}
                      {message.sender === "ai" && message.imageUrl && message.contentType === "image" && (
                        <div className="mt-4">
                          <div className="relative group">
                            <SafeImage
                              src={message.imageUrl}
                              alt="AI Generated Content"
                              className="w-full max-w-md rounded-lg brutalist-border brutalist-shadow-lg"
                              onError={() => {
                                console.error("Error loading image:", message.imageUrl)
                                showToast.error("Failed to load generated image")
                              }}
                            />

                            {/* Image overlay with actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                              <Button
                                size="sm"
                                className="brutalist-button-cyber p-2"
                                onClick={() => {
                                  try {
                                    window.open(message.imageUrl!, "_blank")
                                  } catch (error) {
                                    showToast.error("Failed to open image")
                                  }
                                }}
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="brutalist-button-cyber p-2"
                                onClick={() => handleDownload(message.imageUrl!, message.id)}
                                title="Download image"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* NFT Badge */}
                            {message.nftMinted && (
                              <div className="absolute bottom-2 left-2 bg-lime-400 brutalist-border px-2 py-1">
                                <span className="brutalist-text text-black text-xs">NFT MINTED!</span>
                              </div>
                            )}
                          </div>

                          {/* Mint as NFT Button */}
                          {message.showMintButton && message.contentId && !message.nftMinted && (
                            <div className="mt-4 flex justify-center">
                              <Button
                                onClick={() => mintContentAsNFT(message.contentId!, message.id)}
                                disabled={message.mintingInProgress || operationState.isProcessing}
                                className="brutalist-button-electric px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {message.mintingInProgress ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    MINTING NFT...
                                  </>
                                ) : (
                                  <>
                                    <Coins className="w-4 h-4 mr-2" />
                                    MINT AS NFT
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* List as NFT Button */}
                          {message.nftMinted && message.showListButton && message.nft_mint_address && (
                            <div className="mt-4 flex justify-center">
                              <Input
                                placeholder="NFT PRICE"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className={`brutalist-input font-bold border-red-500`}
                                disabled={message.mintingInProgress || operationState.isProcessing}
                              />
                              <Button
                                onClick={() => ListNFTOnMarketplace(message.nft_mint_address!, message.id)}
                                disabled={message.mintingInProgress || operationState.isProcessing}
                                className="brutalist-button-electric px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {message.mintingInProgress ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    LISTING NFT.........
                                  </>
                                ) : (
                                  <>
                                    <Coins className="w-4 h-4 mr-2" />
                                    LIST ON MARKETPLACE
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <p
                        className={`text-xs brutalist-text mt-2 ${
                          message.sender === "user"
                            ? "text-lime-400"
                            : message.status === "error"
                              ? "text-red-200"
                              : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Transaction Tags - positioned to the right of AI response cards */}
                  {message.sender === "ai" && (
                    <div className="flex flex-col gap-2 mt-2 ml-4">
                      {/* Content Generation Transaction Signature */}
                      {message.transactionSignature && message.istxLabelContentGeneration && (
                        <TransactionTag
                          type="transaction"
                          value={message.transactionSignature}
                          label="CONTENT GEN"
                          className="self-start"
                        />
                      )}
                      
                      {/* NFT Mint Address */}
                      {message.nft_mint_address && message.istxLabelMintAddress && (
                        <TransactionTag
                          type="mint"
                          value={message.nft_mint_address}
                          label="NFT MINT"
                          className="self-start"
                        />
                      )}
                      
                      {/* NFT Mint Transaction Signature */}
                      {message.mintTransactionSignature && message.istxLabelNftMintingTransaction && (
                        <TransactionTag
                          type="transaction"
                          value={message.mintTransactionSignature}
                          label="MINT TXN"
                          className="self-start"
                        />
                      )}
                      
                      {/* NFT Listing Transaction Signature */}
                      {message.transactionSignature && message.istxLabelNftListing && (
                        <TransactionTag
                          type="transaction"
                          value={message.transactionSignature}
                          label="LIST TXN"
                          className="self-start"
                        />
                      )}
                    </div>
                  )}
                </div>

                {message.sender === "user" && (
                  <div className="w-12 h-12 bg-black brutalist-border flex items-center justify-center flex-shrink-0 brutalist-shadow">
                    <User className="h-6 w-6 text-lime-400" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white/95 backdrop-blur-sm brutalist-border-thick brutalist-shadow-lg p-6 w-[50vw] mx-auto mb-7">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="DESCRIBE THE IMAGE YOU WANT TO GENERATE..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={operationState.isProcessing || !connected}
                  className="brutalist-input text-lg py-4 px-4 font-bold placeholder:font-black placeholder:text-gray-400"
                  maxLength={500}
                />
                {newMessage.length > 400 && (
                  <p className="text-xs text-gray-500 mt-1">{500 - newMessage.length} characters remaining</p>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={
                  !newMessage.trim() ||
                  operationState.isProcessing ||
                  !selectedAImodel ||
                  !connected ||
                  newMessage.length > 500
                }
                className="brutalist-button-electric px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !connected
                    ? "Connect wallet first"
                    : !selectedAImodel
                      ? "Select AI model first"
                      : operationState.isProcessing
                        ? "Processing..."
                        : "Send message"
                }
              >
                {operationState.isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </Button>
            </div>

            {/* Status messages */}
            <div className="mt-4 space-y-2">
              {!connected && (
                <p className="brutalist-text text-red-500 text-center">CONNECT YOUR WALLET TO START CREATING!</p>
              )}
              {connected && !selectedAImodel && (
                <p className="brutalist-text text-yellow-600 text-center">SELECT AN AI MODEL TO START CREATING!</p>
              )}
              {operationState.isProcessing && (
                <p className="brutalist-text text-blue-600 text-center">
                  {operationState.currentStep || "PROCESSING YOUR REQUEST..."}
                </p>
              )}
              {operationState.error && (
                <p className="brutalist-text text-red-500 text-center">ERROR: {operationState.error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ChatPart
