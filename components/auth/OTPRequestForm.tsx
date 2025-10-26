"use client";

import { LoginButton } from "@/components/submitButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { useState } from "react";
import { toast } from "sonner";

interface OTPRequestFormProps {
  email: string;
  isLoading: boolean;
  canSubmit: boolean;
  captchaToken: string;
  onEmailChange: (email: string) => void;
  onSwitchToPassword: () => void;
  onResetCaptcha: () => void;
  onRenderCaptcha: () => void;
  onCaptchaRef: (ref: HTMLDivElement | null) => void;
  onOTPSent: (otpId: string) => void;
}

export default function OTPRequestForm({
  email,
  isLoading,
  canSubmit,
  captchaToken,
  onEmailChange,
  onSwitchToPassword,
  onResetCaptcha,
  onRenderCaptcha,
  onCaptchaRef,
  onOTPSent,
}: OTPRequestFormProps) {
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalIsLoading(true);

    if (!captchaToken || captchaToken.trim() === "") {
      toast.error("Please complete the captcha verification");
      setLocalIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${PB_URL}/api/collections/users/request-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            captchaToken: captchaToken,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to send login code. Please try again."
        );

        toast.error(errorMessage);
        return;
      }

      const data = await response.json();

      if (!data.otpId) {
        toast.error("Failed to request OTP - please try again");
        return;
      }

      onOTPSent(data.otpId);
      toast.success("Login code sent! Check your email.");
      onResetCaptcha();
    } catch (error: any) {
      onResetCaptcha();
      setTimeout(onRenderCaptcha, 500);

      const errorMessage =
        error?.message || "Failed to send login code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLocalIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center bg-accent border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          We&apos;ll send a verification code to your email
        </p>
      </div>
      <form onSubmit={handleRequestOTP} className="space-y-4">
        <div>
          <Label
            htmlFor="email-otp"
            className="block text-sm font-medium text-foreground mb-3"
          >
            Email
          </Label>
          <Input
            name="email"
            id="email-otp"
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
        <div
          id="captcha-container"
          ref={onCaptchaRef}
          className="flex justify-center"
        />
        <LoginButton
          isLoading={isLoading || localIsLoading}
          canSubmit={canSubmit}
          label={isLoading || localIsLoading ? "Sending..." : "Send code"}
        />
      </form>

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
        onClick={() => {
          onSwitchToPassword();
          localStorage.removeItem("otpState");
        }}
        className="w-full text-center text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
      >
        Use password instead
      </button>
    </div>
  );
}
