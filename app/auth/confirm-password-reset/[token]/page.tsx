"use client";

import { PocketBaseIcon } from "@/components/PocketBaseIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConfirmPasswordResetPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${PB_URL}/api/collections/users/confirm-password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: password,
            passwordConfirm: passwordConfirm,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to reset password"
        );
        toast.error(errorMessage);
        return;
      }

      setIsConfirmed(true);
      toast.success("Password reset successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login?message=password_reset");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        "Failed to reset password. The link may be expired or invalid.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }

    // Check if URL came from PocketBase's default admin format
    if (
      typeof window !== "undefined" &&
      window.location.href.includes("/_#/")
    ) {
      toast.error(
        "Invalid password reset link. Please request a new password reset email."
      );

      setError(
        "Please configure PocketBase email templates. Check the browser console for instructions."
      );
    }
  }, [token]);

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
              Reset Your Password
            </h1>
            <p className="text-xl text-muted-foreground">
              {isConfirmed
                ? "Your password has been updated"
                : "Enter your new password"}
            </p>
          </div>

          {isConfirmed ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
                <p className="text-sm text-green-400 font-medium mb-2">
                  Password successfully reset!
                </p>
                <p className="text-xs text-muted-foreground">
                  You can now sign in with your new password.
                </p>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          ) : error && !token ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 p-6 text-center">
                <XCircle className="h-12 w-12 text-red-400 mb-4" />
                <p className="text-sm text-red-400 font-medium mb-2">
                  Invalid Link
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>

              <Link href="/auth/reset-password">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  New password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <Label
                  htmlFor="passwordConfirm"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm new password
                </Label>
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !passwordConfirm}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
