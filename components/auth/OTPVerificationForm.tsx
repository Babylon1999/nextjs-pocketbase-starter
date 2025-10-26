"use client";

import { LoginButton } from "@/components/submitButtons";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { saveToken, PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface OTPVerificationFormProps {
  email: string;
  otpId: string;
  isLoading: boolean;
  onSwitchToPassword: () => void;
  onGoBack: () => void;
  onTimerExpired: () => void;
}

export default function OTPVerificationForm({
  email,
  otpId,
  isLoading,
  onSwitchToPassword,
  onGoBack,
  onTimerExpired,
}: OTPVerificationFormProps) {
  const [otpCode, setOtpCode] = useState("");
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();

  // Load timer state from localStorage on component mount
  useEffect(() => {
    const savedOtpState = localStorage.getItem("otpState");
    if (savedOtpState) {
      try {
        const { otpExpiresAt } = JSON.parse(savedOtpState);
        if (otpExpiresAt) {
          const now = Date.now();
          const expiresAt = parseInt(otpExpiresAt);
          const remainingTime = Math.max(
            0,
            Math.floor((expiresAt - now) / 1000)
          );
          setTimeLeft(remainingTime);
          setIsExpired(remainingTime <= 0);
        }
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      onTimerExpired();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          setIsExpired(true);
          onTimerExpired();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimerExpired]);

  // Save timer state to localStorage whenever timeLeft changes
  useEffect(() => {
    const savedOtpState = localStorage.getItem("otpState");
    if (savedOtpState) {
      try {
        const otpState = JSON.parse(savedOtpState);
        const expiresAt = Date.now() + timeLeft * 1000;
        localStorage.setItem(
          "otpState",
          JSON.stringify({ ...otpState, otpExpiresAt: expiresAt.toString() })
        );
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }, [timeLeft]);

  const handleVerifyOTP = useCallback(async () => {
    if (otpCode.length !== 8) {
      toast.error("Please enter the complete 8-digit code");
      return;
    }

    if (isExpired) {
      toast.error("This code has expired. Please request a new one.");
      return;
    }

    setLocalIsLoading(true);

    try {
      const response = await fetch(
        `${PB_URL}/api/collections/users/auth-with-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otpId: otpId,
            password: otpCode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Invalid code. Please try again."
        );

        toast.error(errorMessage);
        return;
      }

      const data = await response.json();

      // Save token to cookie
      saveToken(data.token);

      // Trigger auth state change event
      window.dispatchEvent(new Event("auth-change"));

      // Clear OTP state from localStorage on successful login
      localStorage.removeItem("otpState");

      toast.success("Login successful!");
      router.push("/protected/dashboard");
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLocalIsLoading(false);
    }
  }, [otpCode, otpId, router, isExpired]);

  return (
    <div className="space-y-6">
      <div className="text-center bg-accent border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          We sent a verification code to{" "}
          <strong className="text-foreground">{email}</strong>
        </p>
        {isExpired ? (
          <p className="mt-2 text-xs text-destructive font-medium">
            Code expired. Please request a new one.
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Expires in {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </p>
        )}
        <button
          type="button"
          onClick={onGoBack}
          className="mt-2 text-xs text-primary hover:underline cursor-pointer"
        >
          Use another email?
        </button>
      </div>
      <div className="space-y-4">
        <div className="text-center">
          <Label
            htmlFor="otp-code"
            className="block text-sm font-medium text-foreground mb-4"
          >
            Enter verification code
          </Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={8}
              pattern={REGEXP_ONLY_DIGITS}
              value={otpCode}
              onChange={setOtpCode}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Enter the 8-digit code from your email
          </p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={
              otpCode.length !== 8 || isLoading || localIsLoading || isExpired
            }
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full max-w-xs cursor-pointer"
          >
            {isLoading || localIsLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Verifying...
              </>
            ) : isExpired ? (
              "Code Expired"
            ) : (
              "Verify code"
            )}
          </button>
        </div>
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

      <div className="flex flex-col gap-2">
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
    </div>
  );
}
