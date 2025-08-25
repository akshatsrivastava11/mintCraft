//@ts-nocheck
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Bot, Zap, Settings, Square, AlertCircle, CheckCircle, Trash2, X } from "lucide-react"
import { Navigation } from "./navigation"
import DataTableDemo from "@/components/ui/DataTableDemo"
import useAppstore from "@/state/state"
import { trpc } from "../clients/trpc"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { showToast } from "@/lib/toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Toaster } from "react-hot-toast"

interface UserModel {
  id: string
  name: string
  createdAt: string
  status: "active" | "training" | "inactive"
  type: string
}

interface HeaderPair {
  key: string
  value: string
}

interface ModelFormData {
  royalty: string
  apiEndpoint: string
  description: string
  name: string
  headers: HeaderPair[]
  bodyTemplate: string // Fixed: should be string, not Record<string, any> | null
  userPromptField: string
  httpMethod: string
  responseTemplate: string
  finalContentField: string // Fixed: Added missing field
}

const initialFormData: ModelFormData = {
  royalty: "",
  apiEndpoint: "",
  description: "",
  name: "",
  headers: [{ key: "", value: "" }],
  bodyTemplate: '{\n  "model": "your-model-name",\n  "messages": [\n    {\n      "role": "user",\n      "content": "{{USER_PROMPT}}"\n    }\n  ],\n  "max_tokens": 1000\n}',
  userPromptField: "{{USER_PROMPT}}",
  httpMethod: "POST",
  responseTemplate: '{\n  "finalContent": "{{FINAL_RESPONSE}}"\n}',
  finalContentField: "{{FINAL_RESPONSE}}" // Fixed: Added missing field initialization
}

function CreateModel() {
  const connection = useConnection()
  const { signTransaction, sendTransaction, publicKey, connected } = useWallet()
  const { signingTransaction } = useAppstore()

  const [userModels, setUserModels] = useState<UserModel[]>([])
  const [newModel, setNewModel] = useState<ModelFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<ModelFormData>>({})

  // Mutations with enhanced error handling
  const registerMutation = trpc.aiModelRouter.register.useMutation({
    onSuccess: (data) => {
      console.log("AI Model registered:", data)
      showToast.success("Model registration initiated!")
    },
    onError: (err) => {
      console.error("Failed to register model:", err)
      showToast.error(`Registration failed: ${err.message}`)
      setIsCreating(false)
    },
  })

  const confirmRegisterMutation = trpc.aiModelRouter.confirmRegistration.useMutation({
    onSuccess: (data) => {
      console.log("AI Model registration confirmed:", data)
      showToast.success("🎉 AI Model created successfully!")

      // Add the new model to the list
      const newModelData: UserModel = {
        id: Date.now().toString(),
        name: newModel.name,
        createdAt: new Date().toISOString().split("T")[0],
        status: "training",
        type: "Custom Model",
      }
      setUserModels((prev) => [newModelData, ...prev])

      // Reset form
      setNewModel(initialFormData)
      setShowCreateForm(false)
      setFormErrors({})
    },
    onError: (err) => {
      console.error("Failed to confirm model registration:", err)
      showToast.error(`Confirmation failed: ${err.message}`)
    },
  })

  const initilizeUserConfigMutation = trpc.aiModelRouter.initializeUserConfig.useMutation({
    onSuccess: (data) => {
      console.log("User config initialized:", data)
    },
    onError: (err) => {
      console.error("Failed to initialize user config:", err)
      showToast.error(`Config initialization failed: ${err.message}`)
    },
  })

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<ModelFormData> = {}

    if (!newModel.name.trim()) {
      errors.name = "Model name is required"
    }

    if (!newModel.description.trim()) {
      errors.description = "Description is required"
    }

    if (!newModel.apiEndpoint.trim()) {
      errors.apiEndpoint = "API endpoint is required"
    } else {
      try {
        new URL(newModel.apiEndpoint)
      } catch {
        errors.apiEndpoint = "Please enter a valid URL"
      }
    }

    if (!newModel.royalty.trim()) {
      errors.royalty = "Royalty percentage is required"
    } else {
      const royalty = Number.parseFloat(newModel.royalty)
      if (isNaN(royalty) || royalty < 0 || royalty > 100) {
        errors.royalty = "Royalty must be between 0 and 100"
      }
    }

    if (!newModel.bodyTemplate.trim()) {
      errors.bodyTemplate = "Body template is required"
    } else {
      try {
        console.log("Parsing body template JSON")
        console.log(newModel.bodyTemplate)
        JSON.parse(newModel.bodyTemplate)
      } catch {
        errors.bodyTemplate = "Please enter valid JSON for body template"
      }
    }

    if (!newModel.responseTemplate.trim()) {
      errors.responseTemplate = "Response template is required"
    } else {
      try {
        JSON.parse(newModel.responseTemplate)
      } catch {
        errors.responseTemplate = "Please enter valid JSON for response template"
      }
    }

    if (!newModel.userPromptField.trim()) {
      errors.userPromptField = "User prompt field placeholder is required"
    }

    // Fixed: Added validation for finalContentField
    if (!newModel.finalContentField.trim()) {
      errors.finalContentField = "Final content field placeholder is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchUserModels = async () => {
    try {
      setIsLoading(true)

      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: UserModel[] = [
        {
          id: "1",
          name: "CREATIVE WRITER AI",
          createdAt: "2024-01-15",
          status: "active",
          type: "Content Generation",
        },
        {
          id: "2",
          name: "IMAGE GENERATOR PRO",
          createdAt: "2024-01-10",
          status: "training",
          type: "Image Generation",
        },
        {
          id: "3",
          name: "CODE ASSISTANT",
          createdAt: "2024-01-05",
          status: "inactive",
          type: "Code Generation",
        },
      ]

      setUserModels(mockData)
    } catch (error) {
      console.error("Error fetching models:", error)
      showToast.error("Failed to load your models")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateModel = async () => {
    if (!connected || !publicKey) {
      showToast.error("Please connect your wallet first!")
      return
    }

    if (!validateForm()) {
      showToast.error("Please fix the form errors")
      return
    }

    setIsCreating(true)
    const loadingToast = showToast.loading("Creating your AI model...")

    try {
      // Step 1: Initialize user config
      const ld1=showToast.loading("Initializing user configuration...")
      const response1 = await initilizeUserConfigMutation.mutateAsync()
      console.log("User config initialized:", response1)

      if (response1.serializedTransaction) {
        const ld3=showToast.loading("Please sign the initialization transaction...")
        const responseSigned1 = await signingTransaction(
          signTransaction,
          sendTransaction,
          connection,
          response1.serializedTransaction,
          publicKey.toString(),
        )
        console.log("Initialization signed:", responseSigned1)
        showToast.dismiss(ld3)
      }
      showToast.dismiss(ld1)

      // Step 2: Register the model
      const ld2=showToast.loading("Registering AI model...")

      // Convert headers array to object
      const headersObject = newModel.headers
        .filter(header => header.key.trim() && header.value.trim())
        .reduce((acc, header) => {
          acc[header.key.trim()] = header.value.trim()
          return acc
        }, {} as Record<string, string>)
      
      console.log("Headers object:", headersObject)
      console.log("New model data:", newModel)
      
      const modelData = {
        apiEndpoint: newModel.apiEndpoint,
        description: newModel.description,
        name: newModel.name,
        royaltyPerGeneration: Number.parseFloat(newModel.royalty),
        headersJSONstring: headersObject,
        bodyTemplate: newModel.bodyTemplate,
        userPromptField: newModel.userPromptField,
        httpMethod: newModel.httpMethod,
        responseTemplate: newModel.responseTemplate, // Fixed: Added missing field
        finalContentField: newModel.finalContentField, // Fixed: Added missing field
      }
      

      const response = await registerMutation.mutateAsync(modelData)
      console.log("Registration response:", response)

      if (!response.serializedTransaction) {
        throw new Error("No transaction received from registration")
      }
      // Step 3: Sign registration transaction
      const ld4=showToast.loading("Please sign the registration transaction...")
      
      const responseSigned = await signingTransaction(
        signTransaction,
        sendTransaction,
        connection,
        response.serializedTransaction,
        publicKey.toString(),
      )
      
      if (!responseSigned) {
        throw new Error("Transaction signing failed")
      }
      showToast.dismiss(ld4)
      showToast.dismiss(ld2)
      console.log("Registration signed:", responseSigned)

      // Step 4: Confirm registration
      const ld5=showToast.loading("Confirming model registration...")

      await confirmRegisterMutation.mutateAsync({
        pendingRegistrationId: response.pendingRegistrationId,
        transactionSignature: responseSigned,
      })
      showToast.dismiss(ld5)
    } catch (error: any) {
      console.error("Error creating model:", error)
      showToast.error(error.message || "Failed to create AI model")
    } finally {
      setIsCreating(false)
      showToast.dismiss(loadingToast)
    }
  }

  const handleDeleteModel = (modelId: string) => {
    showToast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setUserModels((prev) => prev.filter((model) => model.id !== modelId))
          resolve(true)
        }, 1000)
      }),
      {
        loading: "Deleting model...",
        success: "Model deleted successfully!",
        error: "Failed to delete model",
      },
    )
  }

  const handleInputChange = (field: keyof ModelFormData, value: string) => {
    setNewModel((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...newModel.headers]
    updatedHeaders[index][field] = value
    setNewModel((prev) => ({ ...prev, headers: updatedHeaders }))
  }

  const addHeaderPair = () => {
    setNewModel((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "" }]
    }))
  }

  const removeHeaderPair = (index: number) => {
    if (newModel.headers.length > 1) {
      const updatedHeaders = newModel.headers.filter((_, i) => i !== index)
      setNewModel((prev) => ({ ...prev, headers: updatedHeaders }))
    }
  }

  const insertPromptPlaceholder = () => {
    const textarea = document.querySelector('textarea[placeholder*="BODY TEMPLATE"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newValue = before + newModel.userPromptField + after

      handleInputChange('bodyTemplate', newValue)

      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + newModel.userPromptField.length, start + newModel.userPromptField.length)
      }, 0)
    }
  }

  // Fixed: Added separate function for response template placeholder insertion
  const insertResponsePlaceholder = () => {
    const textarea = document.querySelector('textarea[placeholder*="RESPONSE TEMPLATE"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newValue = before + newModel.finalContentField + after

      handleInputChange('responseTemplate', newValue)

      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + newModel.finalContentField.length, start + newModel.finalContentField.length)
      }, 0)
    }
  }

  useEffect(() => {
    fetchUserModels()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
        <Navigation />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="LOADING YOUR AI MODELS..." />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
        <Toaster />
        <Navigation />

        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-lime-400 brutalist-border brutalist-shadow-xl flex items-center justify-center">
                <Bot className="h-8 w-8 text-black" />
              </div>
              <h1 className="brutalist-title text-black">YOUR AI ARSENAL</h1>
            </div>
            <p className="brutalist-text text-gray-600 max-w-2xl mx-auto">
              CREATE, MANAGE, AND DEPLOY POWERFUL AI MODELS FOR CONTENT GENERATION
            </p>
          </div>

          {/* Connection Status */}
          {!connected && (
            <div className="bg-red-500 brutalist-border-thick brutalist-shadow-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <AlertCircle className="w-6 h-6 text-white" />
                <p className="brutalist-text text-white">CONNECT YOUR WALLET TO CREATE AI MODELS!</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-lime-400 brutalist-border brutalist-shadow-lg hover:brutalist-shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-black brutalist-border flex items-center justify-center brutalist-shadow">
                    <CheckCircle className="w-7 h-7 text-lime-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-black">
                      {userModels.filter((m) => m.status === "active").length}
                    </p>
                    <p className="brutalist-text text-black text-sm">ACTIVE MODELS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-400 brutalist-border brutalist-shadow-lg hover:brutalist-shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-black brutalist-border flex items-center justify-center brutalist-shadow">
                    <Settings className="w-7 h-7 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-black">
                      {userModels.filter((m) => m.status === "training").length}
                    </p>
                    <p className="brutalist-text text-black text-sm">TRAINING</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-fuchsia-500 brutalist-border brutalist-shadow-lg hover:brutalist-shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-black brutalist-border flex items-center justify-center brutalist-shadow">
                    <Square className="w-7 h-7 text-fuchsia-500 fill-current" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{userModels.length}</p>
                    <p className="brutalist-text text-white text-sm">TOTAL MODELS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Model Form */}
          {showCreateForm && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="bg-white brutalist-border-thick brutalist-shadow-xl">
                <CardHeader className="bg-cyan-400 brutalist-border-thick">
                  <CardTitle className="brutalist-subtitle text-black flex items-center space-x-3">
                    <Bot className="w-6 h-6" />
                    <span>CREATE NEW AI MODEL</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="brutalist-text text-black text-lg font-bold">BASIC INFORMATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="MODEL NAME..."
                          value={newModel.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className={`brutalist-input font-bold ${formErrors.name ? "border-red-500" : ""}`}
                          disabled={isCreating}
                        />
                        {formErrors.name && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <Input
                          placeholder="ROYALTY PERCENTAGE (0-100)..."
                          value={newModel.royalty}
                          onChange={(e) => handleInputChange("royalty", e.target.value)}
                          className={`brutalist-input font-bold ${formErrors.royalty ? "border-red-500" : ""}`}
                          disabled={isCreating}
                          type="number"
                          min="0"
                          max="100"
                        />
                        {formErrors.royalty && (
                          <p className="text-red-500 text-xs font-bold mt-1">{formErrors.royalty}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Input
                        placeholder="DESCRIPTION..."
                        value={newModel.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className={`brutalist-input font-bold ${formErrors.description ? "border-red-500" : ""}`}
                        disabled={isCreating}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-xs font-bold mt-1">{formErrors.description}</p>
                      )}
                    </div>
                  </div>

                  {/* API Configuration */}
                  <div className="space-y-4">
                    <h3 className="brutalist-text text-black text-lg font-bold">API CONFIGURATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="API ENDPOINT (https://...)..."
                          value={newModel.apiEndpoint}
                          onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
                          className={`brutalist-input font-bold ${formErrors.apiEndpoint ? "border-red-500" : ""}`}
                          disabled={isCreating}
                        />
                        {formErrors.apiEndpoint && (
                          <p className="text-red-500 text-xs font-bold mt-1">{formErrors.apiEndpoint}</p>
                        )}
                      </div>
                      <div>
                        <Select
                          value={newModel.httpMethod}
                          onValueChange={(value) => handleInputChange("httpMethod", value)}
                          disabled={isCreating}
                        >
                          <SelectTrigger className="brutalist-input font-bold">
                            <SelectValue placeholder="HTTP METHOD" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Headers Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="brutalist-text text-black text-lg font-bold">REQUEST HEADERS</h3>
                      <Button
                        type="button"
                        onClick={addHeaderPair}
                        className="brutalist-button-cyber text-sm py-2 px-4"
                        disabled={isCreating}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        ADD HEADER
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {newModel.headers.map((header, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <Input
                            placeholder="Header Key (e.g., Authorization)..."
                            value={header.key}
                            onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                            className="brutalist-input font-bold flex-1"
                            disabled={isCreating}
                          />
                          <Input
                            placeholder="Header Value (e.g., Bearer token)..."
                            value={header.value}
                            onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                            className="brutalist-input font-bold flex-1"
                            disabled={isCreating}
                          />
                          {newModel.headers.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeHeaderPair(index)}
                              className="brutalist-button-danger p-2"
                              disabled={isCreating}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body Template Configuration */}
                  <div className="space-y-4">
                    <h3 className="brutalist-text text-black text-lg font-bold">REQUEST BODY TEMPLATE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="USER PROMPT PLACEHOLDER (e.g., {{USER_PROMPT}})..."
                          value={newModel.userPromptField}
                          onChange={(e) => handleInputChange("userPromptField", e.target.value)}
                          className={`brutalist-input font-bold ${formErrors.userPromptField ? "border-red-500" : ""}`}
                          disabled={isCreating}
                        />
                        {formErrors.userPromptField && (
                          <p className="text-red-500 text-xs font-bold mt-1">{formErrors.userPromptField}</p>
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          onClick={insertPromptPlaceholder}
                          className="brutalist-button-electric w-full"
                          disabled={isCreating}
                        >
                          INSERT PLACEHOLDER
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="BODY TEMPLATE (JSON format)..."
                        value={newModel.bodyTemplate}
                        onChange={(e) => handleInputChange("bodyTemplate", e.target.value)}
                        className={`brutalist-input font-bold min-h-[200px] font-mono text-sm ${formErrors.bodyTemplate ? "border-red-500" : ""}`}
                        disabled={isCreating}
                      />
                      {formErrors.bodyTemplate && (
                        <p className="text-red-500 text-xs font-bold mt-1">{formErrors.bodyTemplate}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2 font-bold">
                        Use the placeholder "{newModel.userPromptField}" where user input should be inserted
                      </p>
                    </div>
                  </div>

                  {/* Response Template Configuration - Fixed */}
                  <div className="space-y-4">
                    <h3 className="brutalist-text text-black text-lg font-bold">RESPONSE JSON TEMPLATE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="FINAL CONTENT PLACEHOLDER (e.g., {{FINAL_RESPONSE}})..."
                          value={newModel.finalContentField}
                          onChange={(e) => handleInputChange("finalContentField", e.target.value)}
                          className={`brutalist-input font-bold ${formErrors.finalContentField ? "border-red-500" : ""}`}
                          disabled={isCreating}
                        />
                        {formErrors.finalContentField && (
                          <p className="text-red-500 text-xs font-bold mt-1">{formErrors.finalContentField}</p>
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          onClick={insertResponsePlaceholder}
                          className="brutalist-button-electric w-full"
                          disabled={isCreating}
                        >
                          INSERT PLACEHOLDER
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="RESPONSE TEMPLATE (JSON format)..."
                        value={newModel.responseTemplate}
                        onChange={(e) => handleInputChange("responseTemplate", e.target.value)}
                        className={`brutalist-input font-bold min-h-[150px] font-mono text-sm ${formErrors.responseTemplate ? "border-red-500" : ""}`}
                        disabled={isCreating}
                      />
                      {formErrors.responseTemplate && (
                        <p className="text-red-500 text-xs font-bold mt-1">{formErrors.responseTemplate}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2 font-bold">
                        Use the placeholder <code className="bg-gray-200 px-1 rounded">"{newModel.finalContentField}"</code> where the model output will be injected
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleCreateModel}
                      disabled={isCreating || !connected}
                      className="brutalist-button-electric flex-1 py-4"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          CREATING MODEL...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          CREATE MODEL
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewModel(initialFormData)
                        setFormErrors({})
                      }}
                      className="brutalist-button-danger py-4"
                      disabled={isCreating}
                    >
                      CANCEL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Models Table */}
          <div className="bg-white brutalist-border-thick brutalist-shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="brutalist-subtitle text-black">YOUR AI MODELS</h2>
              <Button onClick={() => fetchUserModels()} className="brutalist-button-cyber" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "REFRESH"}
              </Button>
            </div>

            {userModels.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-300 brutalist-border brutalist-shadow mx-auto mb-4 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-black" />
                </div>
                <h3 className="brutalist-title text-black mb-4">NO MODELS YET</h3>
                <p className="brutalist-text text-gray-600 mb-6">CREATE YOUR FIRST AI MODEL TO GET STARTED</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="brutalist-button-electric"
                  disabled={!connected}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  CREATE FIRST MODEL
                </Button>
              </div>
            ) : (
              <DataTableDemo />
            )}
          </div>

          {/* Floating Add Button */}
          {userModels.length > 0 && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="fixed bottom-8 right-8 w-20 h-20 brutalist-button-electric text-2xl z-50 animate-brutalist-bounce"
              disabled={!connected}
            >
              <Plus className="h-10 w-10" />
            </Button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default CreateModel