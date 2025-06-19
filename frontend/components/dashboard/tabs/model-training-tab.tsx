"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Play, Square, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const datasets = [
  { id: "dataset-1", name: "Voice Dataset 1", size: "2.3 GB" },
  { id: "dataset-2", name: "Multilingual Dataset", size: "5.1 GB" },
  { id: "dataset-3", name: "Custom Voice Clone", size: "1.8 GB" },
]

export function ModelTrainingTab() {
  const [selectedDataset, setSelectedDataset] = useState("")
  // const [batchSize, setBatchSize] = useState("2")
  const [epochs, setEpochs] = useState("10")
  const [isTraining, setIsTraining] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const { toast } = useToast()

  // Simulate WebSocket connection for real-time logs
  // useEffect(() => {
  //   if (isTraining) {
  //     // In a real app, you'd connect to your WebSocket server
  //     const simulateWebSocket = () => {
  //       const logMessages = [
  //         "Initializing training environment...",
  //         "Loading dataset: " + datasets.find((d) => d.id === selectedDataset)?.name,
  //         "Setting up model architecture...",
  //         "Starting training loop...",
  //         "Epoch 1/100 - Loss: 2.456, Accuracy: 0.234",
  //         "Epoch 2/100 - Loss: 2.123, Accuracy: 0.267",
  //         "Epoch 3/100 - Loss: 1.987, Accuracy: 0.289",
  //         "Saving checkpoint at epoch 5...",
  //         "Epoch 5/100 - Loss: 1.756, Accuracy: 0.334",
  //         "Validation loss: 1.823",
  //         "Epoch 10/100 - Loss: 1.456, Accuracy: 0.456",
  //         "Learning rate adjusted to 0.0001",
  //         "Epoch 15/100 - Loss: 1.234, Accuracy: 0.567",
  //         "Training progressing smoothly...",
  //       ]

  //       let messageIndex = 0
  //       const interval = setInterval(() => {
  //         if (messageIndex < logMessages.length && isTraining) {
  //           const timestamp = new Date().toLocaleTimeString()
  //           setLogs((prev) => [...prev, `[${timestamp}] ${logMessages[messageIndex]}`])
  //           messageIndex++
  //         } else if (!isTraining) {
  //           clearInterval(interval)
  //         }
  //       }, 1500)

  //       return () => clearInterval(interval)
  //     }

  //     const cleanup = simulateWebSocket()
  //     return cleanup
  //   }
  // }, [isTraining, selectedDataset])

  useEffect(() => {
    if (isTraining) {
      const ws = new WebSocket("ws://localhost:8000/ws/train-logs")
      wsRef.current = ws

      ws.onmessage = (event) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs((prev) => [...prev, `[${timestamp}] ${event.data}`])
      }

      ws.onerror = () => {
        toast({
          title: "WebSocket Error",
          description: "Failed to connect to training log server.",
          variant: "destructive",
        })
      }

      ws.onclose = () => {
        console.log("WebSocket closed")
      }

      return () => ws.close()
    }
  }, [isTraining])


  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [logs])

const handleStartTraining = async () => {
    if (!selectedDataset) {
      toast({
        title: "No dataset selected",
        description: "Please select a dataset first.",
        variant: "destructive",
      })
      return
    }

    setIsTraining(true)
    setLogs([])

    try {
      const res = await fetch("http://localhost:8000/api/train/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataset: selectedDataset, epochs: Number(epochs) }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to start training")
      }
    } catch (err) {
      toast({
        title: "Error starting training",
        description: String(err),
        variant: "destructive",
      })
      setIsTraining(false)
    }
  }


 
  const handleStopTraining = () => {
    setIsTraining(false)
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] Training stopped by user.`])
    toast({
      title: "Training stopped",
      description: "Model training has been interrupted.",
    })
    wsRef.current?.close()
  }


  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-between">

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Model Training</h2>
        <p className="text-muted-foreground">Train custom TTS models with your datasets</p>
      </div>

 <p className="text-muted-foreground italic text-xl">Exclusively for Nikhil's Team</p>
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>Set up your training parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataset-select">Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        <div>
                          <div className="font-medium">{dataset.name}</div>
                          <div className="text-sm text-muted-foreground">{dataset.size}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    min="1"
                    max="128"
                  />
                </div>
              </div> */}

                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(e.target.value)}
                    min="6"
                    max="1000"
                  />
                </div>

              <div className="pt-4">
                {!isTraining ? (
                  <Button onClick={handleStartTraining} className="w-full" disabled={!selectedDataset}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Training
                  </Button>
                ) : (
                  <Button onClick={handleStopTraining} variant="destructive" className="w-full">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Training
                  </Button>
                )}
              </div>
{/* 
              <div className="pt-4">
                {!isTraining ? (
                  <Button onClick={handleStartTraining} className="w-full" disabled={!false}>
                    <Play className="mr-2 h-4 w-4" />
                    Optimize Model
                  </Button>
                ) : (
                  <Button onClick={handleStopTraining} variant="destructive" className="w-full">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Optimizing Model
                  </Button>
                )}
              </div> */}

              {isTraining && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Training in progress...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Training Logs
              </CardTitle>
              <CardDescription>Real-time training progress and metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
                <div className="font-mono text-sm space-y-1 bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground italic">Training logs will appear here...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-green-600 dark:text-green-400">
                        {log}
                      </div>
                    ))
                  )}
                  {isTraining && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Waiting for next update...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}