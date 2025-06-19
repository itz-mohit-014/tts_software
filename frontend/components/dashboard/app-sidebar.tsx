"use client";

import { Brain, Database, LogOut, Mic, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ModeToggle } from "../mode-toggle";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";

const menuItems = [
  {
    id: "inference",
    title: "Inference",
    icon: Mic,
    description: "Generate speech from text",
  },
  {
    id: "training",
    title: "Model Training",
    icon: Brain,
    description: "Train custom TTS models",
  },
  {
    id: "dataset",
    title: "Dataset Preparation",
    icon: Database,
    description: "Prepare training datasets",
  },
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "Manage your account",
  },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  onLogout,
}: AppSidebarProps) {

const {theme} = useTheme();

const handleLogout = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "http://localhost:8000/api/auth/logout",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.status !== 200) {
      toast({
        title: "Logout failed",
        description: res.data.detail || "An error occurred during logout.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Clear token from localStorage and cookies
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user-data");
    localStorage.removeItem("user_data");
    Cookies.remove("token");

    // ✅ Show success toast
    toast({
      title: "Logout successful",
      description: "You've been logged out.",
    });

    // ✅ Redirect or clear state
    onLogout(); // typically clears auth state and redirects to login

  } catch (err: any) {
    toast({
      title: "Logout failed",
      description: err.response?.data?.detail || "Something went wrong.",
      variant: "destructive",
    });
  }
};

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg overflow-hidden">

            {
              theme === "dark" ? (
                <img src={"/logo_dark_small.jpg"} className="h-10 w-10" />
              ) : (
                <img src={"/logo_light_small.jpg"} className="h-10 w-10" />
              )
            }
            <img />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Text Clonify</h2>
            <p className="text-sm text-muted-foreground">Text-to-Speech</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start h-11"
                    >
                      <div
                        className={`w-full flex items-center space-x-3 px-3 py-5 rounded-lg text-left transition-colors ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="space-y-1 pb-4">
        <ModeToggle/>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
