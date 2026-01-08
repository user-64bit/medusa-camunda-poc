"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";

interface ProductGalleryProps {
  images: HttpTypes.StoreProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
        <span className="text-6xl text-muted-foreground/30">📦</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={images[selectedIndex]?.url || ""}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                selectedIndex === index
                  ? "border-accent"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <Image
                src={image.url}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
