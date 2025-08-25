import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="bg-fuchsia-500 brutalist-border brutalist-shadow-lg p-4 flex items-center justify-center animate-brutalist-shake">
        <Loader2 className={cn("animate-spin text-white", sizeClasses[size])} />
      </div>
      {text && <p className="brutalist-text text-black text-sm">{text}</p>}
    </div>
  )
}
