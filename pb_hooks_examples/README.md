# PocketBase Hook Examples

This directory contains PocketBase hooks for Cloudflare Turnstile captcha verification.

## Files

- main.pb.js - Hooks for captcha verification on OTP requests and user creation

## Setup

1. Copy main.pb.js to your PocketBase pb_hooks directory
2. Replace "your-cf-secret-code" with your Cloudflare Turnstile secret key
3. Restart PocketBase

## Hooks

- OTP Request Captcha: Validates captcha when users request OTP codes
- User Creation Captcha: Validates captcha before creating new accounts

## Notes

- These hooks prevent spam by requiring captcha verification
- Make sure PocketBase can reach https://challenges.cloudflare.com
- Test in development before production
