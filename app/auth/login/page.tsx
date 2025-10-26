"use client";

import { PocketBaseIcon } from "@/components/PocketBaseIcon";
import LoginForm from "@/components/loginForm";
import { Spinner } from "@/components/ui/spinner";
import Script from "next/script";
import { Suspense } from "react";

export default function LoginComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-xl bg-background p-3 border border-border">
                <PocketBaseIcon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-2">
              Welcome back
            </h1>
            <p className="text-xl text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async={true}
            defer={true}
          />

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <a
              href="/auth/signup"
              className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary cursor-pointer"
            >
              Don&apos;t have an account?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
