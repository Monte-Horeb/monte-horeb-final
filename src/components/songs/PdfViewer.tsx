'use client'

import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Use CDN worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  fileUrl: string
  title: string
  t: { view_pdf: string }
}

export default function PdfViewer({ fileUrl, title, t }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }, [])

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Controls */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center justify-between gap-3">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="btn-ghost p-1.5 rounded disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-neutral-600">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="btn-ghost p-1.5 rounded disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.6, scale - 0.2))}
            className="btn-ghost p-1.5 rounded"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-neutral-600">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(Math.min(2.5, scale + 0.2))}
            className="btn-ghost p-1.5 rounded"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="overflow-auto max-h-[70vh] flex justify-center bg-neutral-100 p-4">
        {loading && (
          <div className="py-20 text-neutral-400 text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading...</p>
          </div>
        )}
        <Document
          file={fileUrl}
          onLoadSuccess={onLoadSuccess}
          onLoadError={() => setLoading(false)}
          loading={null}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  )
}
