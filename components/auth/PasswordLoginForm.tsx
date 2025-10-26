"use client";

import { LoginButton } from "@/components/submitButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveToken, PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface PasswordLoginFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  canSubmit: boolean;
  captchaToken: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSwitchToOTP: () => void;
  onResetCaptcha: () => void;
  onRenderCaptcha: () => void;
  onCaptchaRef: (ref: HTMLDivElement | null) => void;
  onClearOTPState: () => void;
}

export default function PasswordLoginForm({
  email,
  password,
  isLoading,
  canSubmit,
  captchaToken,
  onEmailChange,
  onPasswordChange,
  onSwitchToOTP,
  onResetCaptcha,
  onRenderCaptcha,
  onCaptchaRef,
  onClearOTPState,
}: PasswordLoginFormProps) {
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaToken || captchaToken.trim() === "") {
      toast.error("Please complete the captcha verification");
      return;
    }

    try {
      const response = await fetch(
        `${PB_URL}/api/collections/users/auth-with-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identity: email,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Invalid email or password. Please try again."
        );

        toast.error(errorMessage);
        return;
      }

      const data = await response.json();

      // Save token to cookie
      saveToken(data.token);

      // Trigger auth state change event
      window.dispatchEvent(new Event("auth-change"));

      // Clear OTP state on successful password login
      onClearOTPState();

      toast.success("Login successful!");
      router.push("/protected/dashboard");
    } catch (error: any) {
      onResetCaptcha();
      setTimeout(onRenderCaptcha, 500);

      const errorMessage =
        error?.message || "Invalid email or password. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <div>
          <Label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-3"
          >
            Email
          </Label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <Label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-3"
          >
            Password
          </Label>
          <Input
            name="password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            autoComplete="current-password"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div
          id="captcha-container"
          ref={onCaptchaRef}
          className="flex justify-center"
        />
        <LoginButton
          isLoading={isLoading}
          canSubmit={canSubmit}
          label={isLoading ? "Signing in..." : "Sign in"}
        />
      </form>

      <div className="mt-4 text-center">
        <a
          href="/auth/reset-password"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline cursor-pointer"
        >
          Forgot password?
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground text-sm">
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSwitchToOTP}
        className="w-full text-center text-sm text-foreground hover:text-primary transition-colors font-medium cursor-pointer"
      >
        Sign in with OTP
      </button>
    </div>
  );
}
