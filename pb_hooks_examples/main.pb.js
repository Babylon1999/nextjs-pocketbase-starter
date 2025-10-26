// PocketBase Hooks for Cloudflare Turnstile Captcha Verification
// Place this file in your PocketBase pb_hooks directory as main.pb.js

// Validates Cloudflare Turnstile captcha when users request OTP
// Source: https://pocketbase.io/jsvm/functions/onRecordRequestOTPRequest.html

onRecordRequestOTPRequest((e) => {
  const req = e.requestInfo();
  let data = {};

  if (typeof req.body === "string" && req.body.trim() !== "") {
    try {
      data = JSON.parse(req.body);
    } catch {
      throw new BadRequestError("Invalid request format.");
    }
  } else if (req.body && typeof req.body === "object") {
    data = req.body;
  }

  if (!data.captchaToken) {
    throw new BadRequestError("Missing captcha token.");
  }

  const body =
    // or use env $os.getenv("MY_CLOUDFLARE_SECRET_ENV")
    `secret=${encodeURIComponent("your-cf-secret-code")}` +
    `&response=${encodeURIComponent(data.captchaToken)}` +
    `&remoteip=${encodeURIComponent(e.remoteIP())}`;

  try {
    const res = $http.send({
      url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!res.json || !res.json.success) {
      throw new BadRequestError("Captcha verification failed.");
    }

    e.next();
  } catch {
    throw new BadRequestError("Captcha verification service unavailable. Try again later.");
  }
}, "users");

// Validates Cloudflare Turnstile captcha before creating an account
// Source: https://pocketbase.io/jsvm/functions/onRecordCreateRequest.html

onRecordCreateRequest((e) => {
  const req = e.requestInfo();
  let data = {};

  if (typeof req.body === "string" && req.body.trim() !== "") {
    try {
      data = JSON.parse(req.body);
    } catch {
      throw new BadRequestError("Invalid request format.");
    }
  } else if (req.body && typeof req.body === "object") {
    data = req.body;
  }

  if (!data.captchaToken) {
    throw new BadRequestError("Missing captcha token.");
  }

  const body =
    // or use env $os.getenv("MY_CLOUDFLARE_SECRET_ENV")
    `secret=${encodeURIComponent("your-cf-secret-code")}` +
    `&response=${encodeURIComponent(data.captchaToken)}` +
    `&remoteip=${encodeURIComponent(e.remoteIP())}`;

  try {
    const res = $http.send({
      url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!res.json || !res.json.success) {
      throw new BadRequestError("Captcha verification failed.");
    }

    e.next();
  } catch {
    throw new BadRequestError("Captcha verification service unavailable. Try again later.");
  }
}, "users");
