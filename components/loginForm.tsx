"use client";

import OTPRequestForm from "./auth/OTPRequestForm";
import OTPVerificationForm from "./auth/OTPVerificationForm";
import PasswordLoginForm from "./auth/PasswordLoginForm";
import { LoginButton } from "./submitButtons";
import { saveToken } from "@/lib/auth";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";

type AuthMode = "password" | "otp";

export default function LoginForm() {
  const { theme } = useTheme();
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpId, setOtpId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load OTP state from localStorage on component mount
  useEffect(() => {
    const savedOtpState = localStorage.getItem("otpState");
    if (savedOtpState) {
      try {
        const {
          otpSent: savedOtpSent,
          otpId: savedOtpId,
          email: savedEmail,
          otpExpiresAt,
        } = JSON.parse(savedOtpState);
        if (savedOtpSent && savedOtpId && savedEmail) {
          setOtpSent(savedOtpSent);
          setOtpId(savedOtpId);
          setEmail(savedEmail);
          setAuthMode("otp");
          // Check if OTP is already expired
          if (otpExpiresAt) {
            const now = Date.now();
            const expiresAt = parseInt(otpExpiresAt);
            if (now > expiresAt) {
              setOtpExpired(true);
            }
          }
        }
      } catch (error) {
        // Silently handle localStorage errors - not critical for user experience
        localStorage.removeItem("otpState");
      }
    }
  }, []);

  // Save OTP state to localStorage whenever relevant state changes
  useEffect(() => {
    if (otpSent && otpId && email) {
      const expiresAt = Date.now() + 180 * 1000; // 180 seconds from now
      localStorage.setItem(
        "otpState",
        JSON.stringify({
          otpSent,
          otpId,
          email,
          otpExpiresAt: expiresAt.toString(),
        })
      );
    } else {
      localStorage.removeItem("otpState");
    }
  }, [otpSent, otpId, email]);

  const renderCaptcha = useCallback(() => {
    if (!(window as any)?.turnstile || !captchaRef.current) {
      return;
    }

    try {
      // Remove existing widget if present
      if (widgetIdRef.current) {
        (window as any).turnstile.remove(widgetIdRef.current);
      }

      const widgetId = (window as any).turnstile.render(captchaRef.current, {
        sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
        callback: (window as any).handleCaptchaSuccess,
        theme: theme === "light" ? "light" : "dark",
        appearance: "always",
      });
      widgetIdRef.current = widgetId;
    } catch (e) {
      toast.error(
        "Failed to load CAPTCHA verification. Please refresh the page and try again."
      );
    }
  }, [theme]);

  useEffect(() => {
    const message = searchParams.get("message");
    const logout = searchParams.get("logout");

    if (message === "signup_success") {
      toast.success("Account created successfully! Please login to continue.");
    } else if (message === "password_reset") {
      toast.success(
        "Password reset successfully! Please login with your new password."
      );
    }

    if (logout === "true") {
      // Reset captcha state on logout
      resetCaptcha();
      // Wait for component to fully render before rendering captcha

      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      renderTimeoutRef.current = setTimeout(() => {
        renderCaptcha();
      }, 300);
    }
  }, [searchParams, renderCaptcha]);

  // Re-render CAPTCHA when theme changes
  useEffect(() => {
    if ((window as any)?.turnstile && widgetIdRef.current) {
      resetCaptcha();
      setTimeout(renderCaptcha, 100);
    }
  }, [theme, renderCaptcha]);

  useEffect(() => {
    // Cleanup function for component unmount
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  useEffect(() => {
    const handleCaptchaSuccess = (token: string) => {
      setCanSubmit(true);
      setCaptchaToken(token);
    };
    (window as any).handleCaptchaSuccess = handleCaptchaSuccess;

    return () => {
      delete (window as any).handleCaptchaSuccess;
    };
  }, []);

  const resetCaptcha = () => {
    if ((window as any)?.turnstile && widgetIdRef.current) {
      (window as any).turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }
    setCanSubmit(false);
    setCaptchaToken("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        (window as any)?.turnstile &&
        captchaRef.current &&
        !widgetIdRef.current
      ) {
        renderCaptcha();
      }
    }, 100);

    // Store cleanup function
    cleanupRef.current = () => {
      clearTimeout(timer);
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
      resetCaptcha();
    };

    return () => clearTimeout(timer);
  }, [authMode, otpSent, renderCaptcha]);

  const switchToOTP = () => {
    resetCaptcha();
    setAuthMode("otp");
    setPassword("");
    localStorage.removeItem("otpState");
    // Wait for component to fully render before rendering captcha
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(() => {
      renderCaptcha();
    }, 500); // Increased delay to ensure component has fully stabilized
  };

  const switchToPassword = () => {
    resetCaptcha();
    setAuthMode("password");
    setOtpSent(false);
    setOtpId("");
    localStorage.removeItem("otpState");
    // Wait for component to fully render before rendering captcha
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(() => {
      renderCaptcha();
    }, 500); // Increased delay to ensure component has fully stabilized
  };

  const handleOTPSent = (newOtpId: string) => {
    setOtpId(newOtpId);
    setOtpSent(true);
  };

  const clearOTPState = () => {
    setOtpSent(false);
    setOtpId("");
    setOtpExpired(false);
    localStorage.removeItem("otpState");
  };

  // Password Login Form
  if (authMode === "password") {
    return (
      <PasswordLoginForm
        email={email}
        password={password}
        isLoading={isLoading}
        canSubmit={canSubmit}
        captchaToken={captchaToken}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSwitchToOTP={switchToOTP}
        onResetCaptcha={resetCaptcha}
        onRenderCaptcha={renderCaptcha}
        onCaptchaRef={(ref) => {
          if (ref) {
            // @ts-ignore - We need to assign to the ref
            captchaRef.current = ref;
          }
        }}
        onClearOTPState={clearOTPState}
      />
    );
  }

  const handleGoBack = () => {
    setOtpSent(false);
    setOtpId("");
    setOtpExpired(false);
    // Don't reset captcha to preserve its state
    // Wait for component to fully render before rendering captcha if needed
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    renderTimeoutRef.current = setTimeout(() => {
      renderCaptcha();
    }, 100);
  };

  const handleTimerExpired = () => {
    setOtpExpired(true);
    localStorage.removeItem("otpState");
  };

  // OTP Verification Form
  if (otpSent && !otpExpired) {
    return (
      <OTPVerificationForm
        email={email}
        otpId={otpId}
        isLoading={isLoading}
        onSwitchToPassword={switchToPassword}
        onGoBack={handleGoBack}
        onTimerExpired={handleTimerExpired}
      />
    );
  }

  // OTP Expired Form - Show when OTP has expired
  if (otpExpired) {
    return (
      <OTPRequestForm
        email={email}
        isLoading={isLoading}
        canSubmit={canSubmit}
        captchaToken={captchaToken}
        onEmailChange={setEmail}
        onSwitchToPassword={switchToPassword}
        onResetCaptcha={resetCaptcha}
        onRenderCaptcha={renderCaptcha}
        onCaptchaRef={(ref) => {
          if (ref) {
            // @ts-ignore - We need to assign to the ref
            captchaRef.current = ref;
          }
        }}
        onOTPSent={(newOtpId) => {
          handleOTPSent(newOtpId);
          setOtpExpired(false);
        }}
      />
    );
  }

  // OTP Request Form
  return (
    <OTPRequestForm
      email={email}
      isLoading={isLoading}
      canSubmit={canSubmit}
      captchaToken={captchaToken}
      onEmailChange={setEmail}
      onSwitchToPassword={switchToPassword}
      onResetCaptcha={resetCaptcha}
      onRenderCaptcha={renderCaptcha}
      onCaptchaRef={(ref) => {
        if (ref) {
          // @ts-ignore - We need to assign to the ref
          captchaRef.current = ref;
        }
      }}
      onOTPSent={handleOTPSent}
    />
  );
}
