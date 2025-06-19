"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Home, ArrowLeft, Mic, Search } from "lucide-react";
import { useTheme } from "next-themes";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const {theme} = useTheme()

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto text-center bg-inherit">
        {/* Animated 404 Illustration */}

        {/* Content Card */}
        <Card className="bg-inherit border-none shadow-none outline-none">
          {/* <CardHeader> */}
          <div className="relative mb-2">
            <div className="animate-bounce">
              <svg
                width="300"
                height="200"
                viewBox="0 0 300 200"
                className="mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background circles with animation */}
                <circle
                  cx="150"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  opacity="0.2"
                  className="animate-pulse"
                />
                <circle
                  cx="150"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  opacity="0.3"
                  className="animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />

                {/* 404 Text */}
                <text
                  x="150"
                  y="110"
                  textAnchor="middle"
                  className="fill-primary text-6xl font-bold"
                  style={{ fontFamily: "system-ui" }}
                >
                  404
                </text>

                {/* Floating microphone icon */}
                <g className="animate-float">
                  <circle
                    cx="80"
                    cy="60"
                    r="15"
                    fill="hsl(var(--primary))"
                    opacity="0.8"
                  />
                   {
              theme === "dark" ? (
                <img src={"/logo_dark_small.jpg"} className="h-11 w-12" />
              ) : (
                <img src={"/logo_light_small.jpg"} className="h-11 w-12" />
              )
            }
                </g>

                {/* Floating search icon */}
                <g className="animate-float" style={{ animationDelay: "1s" }}>
                  <circle
                    cx="220"
                    cy="140"
                    r="12"
                    fill="hsl(var(--secondary))"
                    opacity="0.8"
                  />
                  <Search className="w-5 h-5" x="215" y="135" />
                </g>

                {/* Sound waves animation */}
                <g className="animate-pulse" style={{ animationDelay: "0.3s" }}>
                  <path
                    d="M 50 100 Q 75 80 100 100 Q 125 120 150 100"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    opacity="0.4"
                  />
                  <path
                    d="M 150 100 Q 175 80 200 100 Q 225 120 250 100"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    opacity="0.4"
                  />
                </g>
              </svg>
            </div>
          </div>
          {/* </CardHeader> */}
          <CardContent className="p-8 pt-0">
            <div className="space-y-6">
              {/* Main heading */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground animate-fade-in">
                  Page Not Found
                </h1>
                <p
                  className="text-xl text-muted-foreground animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  Oops! The page you're looking for doesn't exist.
                </p>
              </div>

              {/* Description */}
              <p
                className="text-muted-foreground max-w-md mx-auto animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                It seems like the page you're trying to reach has been moved,
                deleted, or never existed. Don't worry, let's get you back to
                creating amazing text-to-speech content!
              </p>

              {/* Action buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <Button asChild size="lg" className="min-w-[160px]">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.history.back()}
                  className="min-w-[160px]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p
          className="text-xs text-muted-foreground mt-6 animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          Error Code: 404 • TTS Dashboard
        </p>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
      `}</style>
    </div>
  );
}
