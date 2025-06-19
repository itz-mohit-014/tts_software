"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, Play, Pause, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const models = [
  { id: "xtts-v2", name: "XTTSv2", description: "High-quality multilingual TTS" },
  { id: "your-tts", name: "YourTTS", description: "Voice cloning TTS model" },
  { id: "tacotron2", name: "Tacotron 2", description: "Neural TTS with WaveGlow" },
  { id: "fastspeech2", name: "FastSpeech 2", description: "Fast and robust TTS" },
]

export function InferenceTab() {
  const [selectedModel, setSelectedModel] = useState("")
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [text, setText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const handleLoadModel = async () => {
    if (!selectedModel) {
      toast({
        title: "No model selected",
        description: "Please select a model first.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingModel(true)

    // Simulate model loading
    setTimeout(() => {
      setIsModelLoaded(true)
      setIsLoadingModel(false)
      toast({
        title: "Model loaded successfully",
        description: `${models.find((m) => m.id === selectedModel)?.name} is ready for inference.`,
      })
    }, 2000)
  }

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to synthesize.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate audio generation
    setTimeout(() => {
      // Create a placeholder audio URL (in real app, this would be from your API)
      // Using a simple sine wave generator for demo purposes
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const duration = 3 // 3 seconds
      const frameCount = sampleRate * duration
      const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate)
      const channelData = arrayBuffer.getChannelData(0)

      // Generate a simple sine wave
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.1
      }

      // Convert to WAV blob
      const wavBlob = audioBufferToWav(arrayBuffer)
      const url = URL.createObjectURL(wavBlob)

      setAudioUrl(url)
      setIsGenerating(false)
      toast({
        title: "Audio generated successfully",
        description: "Your speech synthesis is ready!",
      })
    }, 3000)
  }

  // Simple WAV file creation function
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const length = buffer.length
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    const channelData = buffer.getChannelData(0)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, "RIFF")
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, "WAVE")
    writeString(12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, buffer.sampleRate, true)
    view.setUint32(28, buffer.sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, "data")
    view.setUint32(40, length * 2, true)

    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7fff, true)
      offset += 2
    }

    return new Blob([arrayBuffer], { type: "audio/wav" })
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = "generated-speech.wav"
      link.click()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inference</h2>
        <p className="text-muted-foreground">Generate speech from text using pre-trained models</p>
      </div>

 <p className="text-muted-foreground italic text-xl">Exclusively for Nikhil's Team</p>

      </div>


      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Selection</CardTitle>
            <CardDescription>Choose and load a pre-trained TTS model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-select">Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a TTS model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleLoadModel}
              disabled={!selectedModel || isLoadingModel || isModelLoaded}
              className="w-full"
            >
              {isLoadingModel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isModelLoaded ? "Model Loaded" : "Load Model"}
            </Button>

            {isModelLoaded && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                Model ready for inference
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Text Input</CardTitle>
            <CardDescription>Enter the text you want to synthesize</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text to Synthesize</Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="text-sm text-muted-foreground">{text.length} characters</div>
            </div>

            <Button
              onClick={handleGenerateAudio}
              disabled={!isModelLoaded || !text.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Audio
            </Button>
          </CardContent>
        </Card>
      </div>

      {audioUrl && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Generated Audio</CardTitle>
              <CardDescription>Your synthesized speech is ready</CardDescription>
            </div>
            <Button variant="outline" onClick={downloadAudio}>
              <Download className="mr-2 h-4 w-4" />
              Download WAV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Audio Controls */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={togglePlayback}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <div className="text-sm font-medium">generated-speech.wav</div>
                </div>

                <div className="text-sm text-muted-foreground ml-auto">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted rounded-full cursor-pointer" onClick={handleSeek}>
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                />
              </div>

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
