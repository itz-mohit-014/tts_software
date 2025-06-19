"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mic } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface ForgotPasswordFormProps {
  onBack: () => void
  onSuccess: () => void
}

export function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  if (!email) {
    toast({
      title: "Missing Email",
      description: "Please enter your email address.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  try {
    const res = await axios.post("http://localhost:8000/api/auth/forget", {
      email: email.trim().toLowerCase(),
    });

    if (res.status === 200) {
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code.",
      });
      setStep("otp"); // Move to OTP verification step
    } else {
      toast({
        title: "Failed to Send OTP",
        description: res.data?.detail || "Something went wrong.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    const message =
      err.response?.data?.detail || "Unable to send OTP. Please try again.";
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  if (!otp || otp.length !== 6) {
    toast({
      title: "Invalid OTP",
      description: "OTP must be a 6-digit code.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  try {
    const res = await axios.post("http://localhost:8000/api/auth/verify-otp", {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    });

    if (res.status === 200) {
      toast({
        title: "OTP Verified",
        description: "You can now reset your password.",
      });
      localStorage.setItem("resetEmailOtp", otp.trim());
      setStep("reset"); // Move to reset-password stage
    } else {
      toast({
        title: "OTP Verification Failed",
        description: res.data?.detail || "Something went wrong.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    const message =
      err.response?.data?.detail || "Failed to verify OTP. Please try again.";
    toast({
      title: "Verification Error",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

const handlePasswordReset = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    toast({
      title: "Password mismatch",
      description: "Passwords do not match.",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    const res = await axios.post("http://localhost:8000/api/auth/reset-password", {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      new_password: newPassword.trim(),
    });

    if (res.status === 200) {
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      onSuccess(); // optional: redirect to login page or reset state
    } else {
      toast({
        title: "Reset Failed",
        description: res.data?.detail || "Something went wrong.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    const message =
      err.response?.data?.detail || "Failed to reset password. Please try again.";
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <p className="text-muted-foreground italic text-sm">
              Exclusively for Nikhil's Team
            </p>
            <div className="p-3 bg-primary rounded-full">
              <Mic className="h-8 w-8 text-primary-foreground" />
            </div>
               <p className="text-muted-foreground italic text-sm mt-2">
              Exclusively for Nikhil's Team
            </p>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Enter OTP"}
            {step === "reset" && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "reset" && "Create a new password for your account"}
          </CardDescription>

           <p className="text-muted-foreground italic text-xl">
            Exclusively for Nikhil's Team
          </p>
          
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}

          <div className="mt-4">
            <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
