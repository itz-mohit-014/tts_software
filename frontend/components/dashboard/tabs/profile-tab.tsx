"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Eye, EyeOff, User, Mail, Lock, Save, Edit, Mic, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { headers } from "next/headers";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("")
  const { toast } = useToast();
  const [showOtpBOx, setShowOtpBOx] = useState(false);

  const fetchUserData = async (userId: string, token: string) => {
    // Fetch real profile from backend
    await axios
      .get(`http://localhost:8000/api/auth/profile/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((profileData) => {
        setProfile({
          firstName: profileData.data.firstname || "",
          lastName: profileData.data.lastname || "",
          email: profileData.data.email || "",
        });
      })
      .catch((err) => {
        console.error("Profile fetch error:", err.message);
      });
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (userId && token) {
      fetchUserData(userId, token);
    }


  }, []);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleUpdateProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Send OTP to user's email
    const response = await fetch("http://localhost:8000/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: profile.email }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast({
        title: "Failed to send OTP",
        description: data.detail || "Something went wrong while sending the OTP.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // If OTP sent successfully, update local storage and show OTP input box
    const updatedUserData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    };

    localStorage.setItem("user-data", JSON.stringify(updatedUserData));

    setShowOtpBOx(true); // 👈 show the OTP input field
    toast({
      title: "OTP Sent",
      description: "Please check your email and enter the OTP to continue.",
    });
  } catch (error) {
    console.error("Error during profile update:", error);
    toast({
      title: "Error",
      description: "Something went wrong while updating the profile.",
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
    const userData = JSON.parse(localStorage.getItem("user-data") || "{}");
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userData || !userId || !token) {
      toast({
        title: "Missing User Info",
        description: "Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const payload = {
        email: userData.email.trim().toLowerCase(),
        firstname: userData.firstName.trim(),
        lastname: userData.lastName.trim(),
        otp: otp.trim(),
    }

    const res = await axios.put(
      `http://localhost:8000/api/auth/profile/${userId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 200) {
      toast({
        title: "Success",
        description: res.data?.message || "Profile updated.",
      });
    }

    setShowOtpBOx(false);
    setOtp("");
    localStorage.removeItem("user-data")
    setIsEdit(false);

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


  if(showOtpBOx){
    return <div className="flex items-center justify-center h-full">

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
            Enter OTP
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email.
          </CardDescription>

           <p className="text-muted-foreground italic text-xl">
            Exclusively for Nikhil's Team
          </p>
          
        </CardHeader>
        <CardContent>
        
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

          <div className="mt-4">
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowOtpBOx(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to profile
            </Button>
          </div>
        </CardContent>
      </Card>
          </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and personal information
          </p>
        </div>

        <p className="text-muted-foreground italic text-xl">
          Exclusively for Nikhil's Team
        </p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter your first name"
                    required
                    disabled={!isEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter your last name"
                    required
                    disabled={!isEdit}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={!isEdit}
                />
              </div>

              <div className="pt-4 flex justify-between items-center gap-4">
                <Button
                  type="submit"
                  disabled={isLoading || !isEdit}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  className="w-full md:w-auto bg-blue-700 hover:bg-blue-500"
                  onClick={() => setIsEdit(!isEdit)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
