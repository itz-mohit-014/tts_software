"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ForgotPasswordForm } from "./forgot-password-form";
import { Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {theme} = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await axios.post("http://localhost:8000/api/auth/login", {
      email,
      password,
    });

    if (res.status !== 200 || !res.data?.access_token) {
      toast({
        title: "Login failed",
        description: res.data.detail || "An error occurred during login.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const token = res.data.access_token;
    
    Cookies.set("token", token, { expires: 7, secure: true }); 

    localStorage.setItem("token", token);
    localStorage.setItem("user_id", res.data.user_id);

    toast({
      title: "Login successful",
      description: "Welcome to TTS Dashboard!",
    });
    
    onLogin()
  } catch (err: any) {
    toast({
      title: "Login failed",
      description: err.response?.data?.detail || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground italic text-sm">
              Exclusively for Nikhil's Team
            </p>
            <div className="bg-primary p-2 rounded-full overflow-hidden">

            {
              theme === "dark" ? (
                <img src={"/logo_dark_small.jpg"} className="h-11 w-12" />
              ) : (
                <img src={"/logo_light_small.jpg"} className="h-11 w-12" />
              )
            }
          </div>
            <p className="text-muted-foreground italic text-sm mt-2">
              Exclusively for Nikhil's Team
            </p>
          </div>
          <CardTitle className="text-2xl font-bold">TTS Dashboard</CardTitle>
          <CardDescription>
            Sign in to your Text-to-Speech account
          </CardDescription>
          <p className="text-muted-foreground italic text-xl">
            Exclusively for Nikhil's Team
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
