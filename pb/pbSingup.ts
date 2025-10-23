"use server";

import { generateSecret, generateToken } from "./pbCsrfToken";
import {
  sanitizeToken,
  sanitizeEmail,
  sanitizePassword,
  sanitizeName,
} from "@/lib/sanitize";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const ApiKey = process.env.SECURE_API_KEY as string;

export async function Signup(formData: any) {
  "use server";
  const captchaToken = sanitizeToken(
    formData.get("cf-turnstile-response") as string
  );
  const name = sanitizeName(formData.get("name") as string);
  const email = sanitizeEmail(formData.get("email") as string);
  const password = sanitizePassword(formData.get("password") as string);
  const ConfirmPassword = sanitizePassword(
    formData.get("confirm-password") as string
  );

  const ip = (await headers()).get("X-Forwarded-For");

  // Starting the captcha verification process.
  let CaptchaForm = new FormData();
  CaptchaForm.append(
    "secret",
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY as string
  );
  CaptchaForm.append("response", captchaToken as string);
  CaptchaForm.append("remoteip", ip as string);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const firstResult = await fetch(url, {
    body: CaptchaForm,
    method: "POST",
  });
  const firstOutcome = await firstResult.json();

  if (firstOutcome.success === false) {
    return {
      success: false,
      error:
        "Captcha token is invalid. Try refreshing the page and submitting the form again.",
    };
  }
  try {
    const response = await fetch(
      `${process.env.PB_URL}/api/collections/users/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // This is the API key that will help us access the PB instance.
          "X-POCKETBASE-API-KEY": ApiKey,
          "PB-USER-IP": (await headers()).get("X-Forwarded-For") || "0.0.0.0",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          passwordConfirm: ConfirmPassword,
          name: name,
          secret: await generateSecret(),
        }),
      }
    );
    const res = await response.json();
    if (response.status !== 200) {
      return {
        error: JSON.stringify(res.data),
      };
    }

    const generateJWTToken = await fetch(
      `${process.env.PB_URL}/api/collections/users/auth-with-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-POCKETBASE-API-KEY": ApiKey,
          "PB-USER-IP": (await headers()).get("X-Forwarded-For") || "0.0.0.0",
        },
        body: JSON.stringify({ identity: email, password }),
      }
    );
    const JWTTokenResPonse = await generateJWTToken.json();
    if (response.status !== 200) {
      return {
        error: JSON.stringify(JWTTokenResPonse.data),
      };
    }
    (await cookies()).set("pb-cookie", JWTTokenResPonse.token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
  } catch (error: any) {
    return { error: error.message };
  }
  redirect("protected/dashboard");
}
