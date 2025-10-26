"use client";

import { PocketBaseIcon } from "@/components/PocketBaseIcon";
import SignupForm from "@/components/signUpForm";
import Script from "next/script";

export default function SignupComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

      {/* Content */}
      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-xl bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-background rounded-xl border border-border">
                <PocketBaseIcon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-2">
              Create account
            </h1>
            <p className="text-xl text-muted-foreground">
              Create your account to get started
            </p>
          </div>

          <SignupForm />

          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async={true}
            defer={true}
          />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?
            </span>{" "}
            <a
              href="/auth/login"
              className="text-foreground hover:text-primary font-medium transition-colors underline underline-offset-4"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
