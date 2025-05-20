"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Skeleton } from "@/components/ui/skeleton"

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  url: string
  currentPage: number
  zoom: number
  onTotalPagesChange: (pages: number) => void
  onPageChange: (page: number) => void
}

export function PDFViewer({ url, currentPage, zoom, onTotalPagesChange, onPageChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(800)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    onTotalPagesChange(numPages)
    setIsLoading(false)
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error)
    setIsLoading(false)
  }

  return (
    <div ref={containerRef} className="flex justify-center">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<Skeleton className="h-[1100px] w-full" />}
      >
        {isLoading ? (
          <Skeleton className="h-[1100px] w-full" />
        ) : (
          <Page
            pageNumber={currentPage}
            width={width * zoom}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            onLoadSuccess={() => {
              // Scroll to top when page changes
              if (containerRef.current) {
                containerRef.current.scrollTop = 0
              }
            }}
          />
        )}
      </Document>
    </div>
  )
}
