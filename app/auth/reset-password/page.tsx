"use client";

import { PocketBaseIcon } from "@/components/PocketBaseIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${PB_URL}/api/collections/users/request-password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to send password reset email"
        );
        toast.error(errorMessage);
        return;
      }

      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        "Failed to send password reset email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-xl bg-background border border-border p-3">
                <PocketBaseIcon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-2">
              Reset Password
            </h1>
            <p className="text-xl text-muted-foreground">
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                <p className="text-sm text-green-400">
                  We&apos;ve sent a password reset link to{" "}
                  <strong className="text-foreground">{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please check your inbox and follow the instructions to reset
                  your password.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full"
              >
                Send to different email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
