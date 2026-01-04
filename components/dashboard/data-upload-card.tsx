"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function DataUploadCard({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file")
        return
      }
      setFile(selectedFile)
      setError(null)
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      const response = await fetch("/api/upload-financial-data", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadSuccess(true)
      setFile(null)

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        router.refresh()
        setUploadSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Financial Data
        </CardTitle>
        <CardDescription>Upload a CSV file containing your financial statement data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            CSV should contain columns: company_name, fiscal_year, fiscal_period, revenue, expenses, etc.
          </p>
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}

        {uploadSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle2 className="h-4 w-4" />
            File uploaded successfully!
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full gap-2">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Process
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
