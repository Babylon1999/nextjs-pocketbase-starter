"use client";

import { SignUpButton } from "./submitButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export default function SignupForm() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const router = useRouter();

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
    const handleCaptchaSuccess = (token: string) => {
      setCanSubmit(true);
      setCaptchaToken(token);
    };
    (window as any).handleCaptchaSuccess = handleCaptchaSuccess;

    return () => {
      delete (window as any).handleCaptchaSuccess;
    };
  }, []);

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
  }, [renderCaptcha]);

  // Re-render CAPTCHA when theme changes
  useEffect(() => {
    if ((window as any)?.turnstile && widgetIdRef.current) {
      resetCaptcha();
      setTimeout(renderCaptcha, 100);
    }
  }, [theme, renderCaptcha]);

  const resetCaptcha = () => {
    if ((window as any)?.turnstile && widgetIdRef.current) {
      (window as any).turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }
    setCanSubmit(false);
    setCaptchaToken("");
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!captchaToken || captchaToken.trim() === "") {
        toast.error("Please complete the captcha verification");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      // Direct fetch to PocketBase
      const response = await fetch(`${PB_URL}/api/collections/users/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          name: name,
          password: password,
          passwordConfirm: confirmPassword,
          emailVisibility: true,
          captchaToken: captchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to create account. Please try again."
        );
        toast.error(errorMessage);
        return;
      }

      toast.success("Account created successfully! Redirecting to login...");

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      resetCaptcha();

      // Redirect to login page with success message
      setTimeout(() => {
        router.push("/auth/login?message=signup_success");
      }, 1500);
    } catch (error: any) {
      resetCaptcha();

      const errorMessage =
        error?.message || "Failed to create account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateAccount} className="space-y-4">
      <div>
        <Label
          htmlFor="name"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Full name
        </Label>
        <Input
          name="name"
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          autoFocus
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <Label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Email address
        </Label>
        <Input
          name="email"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <Label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Password
        </Label>
        <Input
          name="password"
          id="password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>
      <div>
        <Label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Confirm password
        </Label>
        <Input
          name="confirm-password"
          id="confirm-password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div ref={captchaRef} className="flex justify-center" />
      <SignUpButton
        isLoading={isLoading}
        canSubmit={canSubmit}
        label="Create Account"
      />
    </form>
  );
}
