"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { InferenceTab } from "./tabs/inference-tab"
import { ModelTrainingTab } from "./tabs/model-training-tab"
import { DatasetPreparationTab } from "./tabs/dataset-preparation-tab"
import { ProfileTab } from "./tabs/profile-tab"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("inference")

  const renderActiveTab = () => {
    switch (activeTab) {
      case "inference":
        return <InferenceTab />
      case "training":
        return <ModelTrainingTab />
      case "dataset":
        return <DatasetPreparationTab />
      case "profile":
        return <ProfileTab />
      default:
        return <InferenceTab />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader onLogout={onLogout} />
          <main className="flex-1 p-6 bg-muted/10">{renderActiveTab()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
