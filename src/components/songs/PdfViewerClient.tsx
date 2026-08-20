'use client'

import dynamic from 'next/dynamic'

/**
 * react-pdf pulls in pdfjs-dist, which touches browser-only globals
 * (DOMMatrix, Path2D) at module scope. Loading it with `ssr: false` keeps
 * it out of the server render entirely.
 *
 * `ssr: false` is not allowed inside a Server Component, which is why this
 * thin client wrapper exists.
 */
const PdfViewer = dynamic(() => import('./PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl border border-neutral-200 py-20 text-center">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-neutral-400">Loading viewer...</p>
    </div>
  ),
})

export default PdfViewer
