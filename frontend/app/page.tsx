"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { toast } from "@/hooks/use-toast"
import axios from "axios"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const validateUser = async (userId: string, token: string) => {
  try {
    const res = await axios.get(`http://localhost:8000/api/auth/profile/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.data) {
      console.error("Authentication error:", res);
      toast({
        title: "Authentication Error",
        description: res.statusText || "An unknown error occurred.",
        variant: "destructive",
      });
      setIsAuthenticated(false);
      return;
    }

    const data = res.data;

    if (data && data._id) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

  } catch (err) {
    console.error("Auth check failed:", err);
    toast({
      title: "Network Error",
      description: "Failed to connect to the server.",
      variant: "destructive",
    });
    setIsAuthenticated(false);
  } finally {
    setIsLoading(false);
  }
};

 useEffect(() => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  
  if (token && userId) {
      validateUser(userId, token)
  } else {
    setIsAuthenticated(false);
    setIsLoading(false);
  }
}, []);


  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <main>{isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} />}</main>
}
