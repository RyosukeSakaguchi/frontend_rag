"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFViewer } from "@/components/pdf-viewer"
import { SearchResults } from "@/components/search-results"
import { searchDocument } from "@/lib/search"

export default function Home() {
  const [query, setQuery] = useState<string>("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [zoom, setZoom] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<string>("search")
  const [pdfUrl, setPdfUrl] = useState<string>("/alphabet-10k-2024.pdf")

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)

    try {
      // In a real application, this would call an API to search the document
      const searchResults = await searchDocument(query, pdfUrl)
      setResults(searchResults)

      // If we have results, jump to the first result page
      if (searchResults.length > 0 && searchResults[0].page) {
        setCurrentPage(searchResults[0].page)
      }

      setActiveTab("results")
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleZoom = (factor: number) => {
    const newZoom = Math.max(0.5, Math.min(2, zoom + factor))
    setZoom(newZoom)
  }

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header with search */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">年次レポート検索</h1>
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="質問を入力してください（例：2023年のgoogleの現金及び現金同等物）"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 pr-4 py-2 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              {isSearching ? "検索中..." : "検索"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleZoom(-0.1)}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon" onClick={() => handleZoom(0.1)}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-100">
            <PDFViewer
              url={pdfUrl}
              currentPage={currentPage}
              zoom={zoom}
              onTotalPagesChange={setTotalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="w-1/2 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="search">検索</TabsTrigger>
                <TabsTrigger value="results">検索結果</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="search" className="flex-1 p-4 overflow-auto">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">検索のヒント</h2>
                  <p className="mb-2">以下のような質問を試してみてください：</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>2023年のgoogleの現金及び現金同等物</li>
                    <li>Alphabetの総収益</li>
                    <li>Google Cloudの収益</li>
                    <li>研究開発費</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="results" className="flex-1 overflow-auto">
              <SearchResults
                results={results}
                query={query}
                onResultClick={(page) => {
                  setCurrentPage(page)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
