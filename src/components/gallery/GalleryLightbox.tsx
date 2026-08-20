'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import type { Lang, GalleryPhoto } from '@/types'

interface GalleryLightboxProps {
  photos: GalleryPhoto[]
  lang: Lang
  t: any
}

export default function GalleryLightbox({ photos, lang, t }: GalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const current = selectedIndex !== null ? photos[selectedIndex] : null

  return (
    <>
      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <img
              src={photo.image_url}
              alt={photo.caption_en || 'Photo'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {current !== null && selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <img
              src={current.image_url}
              alt={current.caption_en || 'Photo'}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* Caption */}
            {(lang === 'es' ? current.caption_es : current.caption_en) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 text-sm">
                {lang === 'es' ? current.caption_es : current.caption_en}
              </div>
            )}

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Navigation */}
            {selectedIndex > 0 && (
              <button
                onClick={() => setSelectedIndex(selectedIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedIndex < photos.length - 1 && (
              <button
                onClick={() => setSelectedIndex(selectedIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
