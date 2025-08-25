"use client"

import React from "react"
import { Button } from "./button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "./card"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen bg-white/90 backdrop-blur-sm flex items-center justify-center p-8">
          <Card className="bg-red-500 brutalist-border-thick brutalist-shadow-xl max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-black brutalist-border mx-auto mb-6 flex items-center justify-center brutalist-shadow">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="brutalist-title text-white text-2xl mb-4">SYSTEM ERROR!</h2>
              <p className="brutalist-text text-white text-sm mb-6">SOMETHING WENT WRONG. DON'T PANIC!</p>
              <Button onClick={this.resetError} className="brutalist-button-electric w-full">
                <RefreshCw className="w-5 h-5 mr-2" />
                TRY AGAIN
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
