export default function IndexPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Next.js + PocketBase
          </h1>
          <p className="text-xl text-muted-foreground mt-6 leading-8">
            A modern starter template with authentication, OTP login, and
            protected routes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/auth/signup"
              className="rounded-md bg-primary text-primary-foreground px-3.5 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/auth/login"
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              Sign In <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Heads up:
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                For captcha validation to work, you need to add the PocketBase
                hooks from the pb_hooks_examples directory to your PocketBase
                instance. <br></br>Make sure to replace
                &quot;your-cf-secret-code&quot; with your actual Cloudflare
                Turnstile secret key, or use environment variables with
                $os.getenv(&quot;MY_CLOUDFLARE_SECRET_ENV&quot;).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm">
            {`// PocketBase Hooks for Cloudflare Turnstile Captcha Verification
// Place in pb_hooks/main.pb.js

// Validates captcha when users request OTP
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
    \`secret=\${encodeURIComponent("your-cf-secret-code")}\` +
    \`&response=\${encodeURIComponent(data.captchaToken)}\` +
    \`&remoteip=\${encodeURIComponent(e.remoteIP())}\`;

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

// Validates captcha before creating an account
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
    \`secret=\${encodeURIComponent("your-cf-secret-code")}\` +
    \`&response=\${encodeURIComponent(data.captchaToken)}\` +
    \`&remoteip=\${encodeURIComponent(e.remoteIP())}\`;

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
}, "users");`}
          </pre>
        </div>
      </div>
    </div>
  );
}
