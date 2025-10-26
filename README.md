
# Next.js PocketBase Starter

A starter template with Next.js 15, PocketBase backend, and authentication including password and OTP login with Cloudflare Turnstile captcha protection.

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```
4. Rename `.env.example` to `.env` and add the following environment variables:

```
    # Your pb url
    NEXT_PUBLIC_POCKETBASE_URL=https://your-pb-instance-url.com
    # NEXT.JS website URL
    WEBSITE_URL=http://localhost:3000
    # This is the public key that will be shipped to the browser
    NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x
    # This is the secret key used to validate the token in the server side.
    CLOUDFLARE_TURNSTILE_SECRET_KEY=0x
```

5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Pages & Layout

- `/` - Landing page with setup instructions
- `/auth/login` - Login page with password and OTP options
- `/auth/signup` - User registration with captcha
- `/auth/reset-password` - Password reset request
- `/auth/confirm-password-reset/[token]` - Password reset confirmation
- `/protected/dashboard` - Protected dashboard page
- `/protected/account` - User profile management
- `/protected/account/security` - Password change and security settings

The layout includes a global header with navigation and a global footer with ACME branding.

## Captcha Setup with PocketBase Hooks

This template uses Cloudflare Turnstile captcha to protect login, signup, and OTP requests. To enable captcha verification:

1. Copy `pb_hooks_examples/main.pb.js` to your PocketBase `pb_hooks` directory
2. Replace `"your-cf-secret-code"` with your actual Cloudflare Turnstile secret key
3. Restart PocketBase

The hooks validate captcha tokens for:
- OTP requests (`onRecordRequestOTPRequest`)
- User creation (`onRecordCreateRequest`)

Make sure your PocketBase instance can reach `https://challenges.cloudflare.com` for captcha verification.

## Features

- **Authentication**: Password login and OTP (One-Time Password) via email
- **Captcha Protection**: Cloudflare Turnstile integration for all auth forms
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Account Management**: Update profile, change password, delete account
- **OTP Features**: 180-second expiration, auto-redirect, persistent state
- **UI Components**: Built with shadcn/ui and Tailwind CSS

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
