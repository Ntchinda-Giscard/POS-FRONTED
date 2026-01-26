"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { fetchProductImage } from "@/lib/api"
import { ImageOff, Loader2 } from "lucide-react"

interface ProductImageProps {
  item_code: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export function ProductImage({ item_code, alt, className, width = 120, height = 120 }: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadImage = async () => {
      setLoading(true)
      try {
        const result = await fetchProductImage(item_code)
        if (mounted && result.success && result.data?.image) {
          setImageSrc(`data:image/jpeg;base64,${result.data.image}`)
        }
      } catch (error) {
        console.error("Failed to load image", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Use Intersection Observer could be better but this is a good start. 
    // For now simple lazy load on mount.
    loadImage()

    return () => {
      mounted = false
    }
  }, [item_code])

  if (loading) {
    return (
      <div 
        className={`bg-muted animate-pulse flex items-center justify-center rounded-md ${className}`}
        style={{ width: "100%", height: "100%", minHeight: height }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
      </div>
    )
  }

  if (!imageSrc) {
    return (
        <div 
        className={`bg-muted flex items-center justify-center text-muted-foreground rounded-md ${className}`}
        style={{ width: "100%", height: "100%", minHeight: height }}
      >
        <ImageOff className="h-8 w-8 opacity-50" />
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover rounded-md ${className}`}
    />
  )
}
