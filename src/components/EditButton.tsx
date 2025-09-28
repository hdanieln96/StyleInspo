"use client"

import * as React from "react"
import { Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditButtonProps {
  onClick: () => void
  className?: string
  size?: "sm" | "default"
  variant?: "floating" | "inline"
  disabled?: boolean
  "aria-label"?: string
}

export function EditButton({
  onClick,
  className,
  size = "sm",
  variant = "floating",
  disabled = false,
  "aria-label": ariaLabel = "Edit",
}: EditButtonProps) {
  const baseStyles = variant === "floating"
    ? "absolute opacity-0 group-hover:opacity-80 hover:!opacity-100 bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 border border-gray-200 shadow-sm transition-all duration-200"
    : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200"

  return (
    <Button
      onClick={onClick}
      size={size}
      variant="ghost"
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        baseStyles,
        "rounded-md",
        size === "sm" ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
        className
      )}
    >
      <Edit2 className={cn(
        "shrink-0",
        size === "sm" ? "h-3 w-3" : "h-4 w-4"
      )} />
    </Button>
  )
}