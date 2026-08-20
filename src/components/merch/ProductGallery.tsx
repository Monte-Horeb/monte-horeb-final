'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'

interface ProductGalleryProps {
  mainImage: string | null
  galleryImages: string[] | null
  title: string
}

/**
 * Product imagery with thumbnail switching.
 *
 * This lives in its own client component because the thumbnails need an
 * onClick handler - the product page itself is a server component, and
 * passing an event handler from there is a build error in the App Router.
 */
export default function ProductGallery({
  mainImage,
  galleryImages,
  title,
}: ProductGalleryProps) {
  const images = [mainImage, ...(galleryImages || [])].filter(Boolean) as string[]
  const [active, setActive] = useState(0)
  const current = images[active] ?? null

  if (!current) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
        <BookOpen className="w-16 h-16 text-neutral-300" />
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-4">
        <img src={current} alt={title} className="w-full h-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`aspect-square rounded-lg overflow-hidden bg-neutral-100 transition
                ${i === active ? 'ring-2 ring-primary-600' : 'hover:ring-2 hover:ring-primary-400'}`}
            >
              <img
                src={img}
                alt={`${title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
