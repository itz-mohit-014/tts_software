"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, File, Loader2, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  name: string
  size: number
  type: string
  path: string
}

export function DatasetPreparationTab() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [preparationProgress, setPreparationProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const acceptedFileTypes = ".zip,.wav,.txt,.mp3,.flac"

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Simulate file upload
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      if (!acceptedFileTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        continue
      }

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        path: `/uploads/${file.name}`,
      }

      setUploadedFiles((prev) => [...prev, uploadedFile])
    }

    setIsUploading(false)
    toast({
      title: "Files uploaded successfully",
      description: `${files.length} file(s) have been uploaded.`,
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStartPreparation = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files to prepare",
        description: "Please upload some files first.",
        variant: "destructive",
      })
      return
    }

    setIsPreparing(true)
    setPreparationProgress(0)

    // Simulate preparation process
    const steps = [
      "Extracting files...",
      "Validating audio files...",
      "Normalizing audio levels...",
      "Generating transcriptions...",
      "Creating training manifest...",
      "Splitting dataset...",
      "Finalizing preparation...",
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setPreparationProgress(((i + 1) / steps.length) * 100)

      toast({
        title: "Preparation Progress",
        description: steps[i],
      })
    }

    setIsPreparing(false)
    toast({
      title: "Dataset preparation complete",
      description: "Your dataset is ready for training!",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
       <div className="flex gap-2 flex-wrap justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dataset Preparation</h2>
        <p className="text-muted-foreground">Upload and prepare your training datasets</p>
      </div>

       <p className="text-muted-foreground italic text-xl">Exclusively for Nikhil's Team</p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>Upload your dataset files (.zip, .wav, .txt, .mp3, .flac)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.length > 0 ? (
              <div className="space-y-2">
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          
          : <>

           <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports: ZIP, WAV, TXT, MP3, FLAC files</p>
              </div>
              <Button onClick={handleFileSelect} className="mt-4" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Select Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes}
              onChange={handleFileChange}
              className="hidden"
            />
          </>
          }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preparation</CardTitle>
            <CardDescription>Process your uploaded files for training</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPreparing && preparationProgress === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">Upload files to begin preparation</div>
                <Button onClick={handleStartPreparation} disabled={uploadedFiles.length === 0}>
                  Start Preparation
                </Button>
              </div>
            )}

            {isPreparing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Preparing dataset...</span>
                </div>
                <Progress value={preparationProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">{Math.round(preparationProgress)}% complete</p>
              </div>
            )}

            {!isPreparing && preparationProgress === 100 && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <div className="space-y-2">
                  <p className="font-medium text-green-600 dark:text-green-400">Dataset preparation complete!</p>
                  <p className="text-sm text-muted-foreground">Your dataset is ready for model training.</p>
                </div>
                <Button
                  onClick={() => {
                    setPreparationProgress(0)
                    setUploadedFiles([])
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Prepare New Dataset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
