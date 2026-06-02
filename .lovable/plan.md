# Custom Application-Level OTP (Replace Supabase Magic Link)

Move from `supabase.auth.signInWithOtp()` (which sends Magic Links) to a self-managed numeric OTP layered **on top** of standard Supabase password / Google OAuth sessions. After Supabase authenticates the user, we require an additional 6-digit OTP step before any protected route is reachable.

## 1. Database (migration)

New table `public.login_otps`:

- `id uuid pk default gen_random_uuid()`
- `email text not null`
- `otp_hash text not null` (sha256 hex of code — no plaintext)
- `expires_at timestamptz not null`
- `used boolean not null default false`
- `attempts int not null default 0`
- `created_at timestamptz not null default now()`

Index on `(email, used, expires_at)`. RLS **enabled with no policies** — only edge functions (service role) read/write. GRANT to `service_role` only.

Also a tiny `login_otp_resends(email text, created_at timestamptz)` table for resend rate limiting (or reuse `created_at` in `login_otps`). Will keep it simple: rate limit by counting recent rows in `login_otps` for the email.

## 2. Edge Functions

`supabase/functions/send-login-otp/index.ts`
- Input: `{ email }` (validated with zod, lowercased).
- Verifies caller is an authenticated Supabase user whose email matches (decodes JWT via service-role `getUser`). This prevents arbitrary email spam.
- Rate limit: max 3 sends per email per 10 min, 30-second cooldown between sends.
- Invalidates previous unused OTPs for that email (`update ... set used=true`).
- Generates 6-digit code, stores sha256 hash with `expires_at = now() + 10 min`.
- Sends branded email via **Resend** (`RESEND_API_KEY` secret) — subject "Your PrivacyOps verification code", body shows the 6 digits + 10-min notice.
- Returns `{ ok: true }`.

`supabase/functions/verify-login-otp/index.ts`
- Input: `{ email, code }`.
- Requires authenticated caller matching email.
- Loads latest unused, unexpired row for email. Increments `attempts`; locks (used=true) after 5.
- Compares sha256(code) to stored hash in constant-ish time.
- On success: `used=true`, then sets `app_metadata.mfa_verified_at = now()` on the auth user via service-role `auth.admin.updateUserById`. Returns `{ ok: true }`.
- On failure: `{ ok: false, error }`.

Both functions: `verify_jwt = false` in code (we validate manually via service role) so we can also handle the post-OAuth case before middleware. CORS headers on every response.

## 3. Resend integration

- Add `RESEND_API_KEY` via the secrets tool (must request from user).
- Sender: `PrivacyOps <onboarding@resend.dev>` for now (note: only deliverable to the Resend account owner unless a domain is verified — flag this to the user).

## 4. AuthContext (`src/context/AuthContext.tsx`)

- **Remove** all `supabase.auth.signInWithOtp` / `verifyOtp` calls.
- `login(email, password)`:
  1. `signInWithPassword`.
  2. If `admin@kpmg.com` demo bypass — skip MFA (existing behavior).
  3. Otherwise call `send-login-otp` edge function (auth token attached automatically). Do **not** `signOut` — we keep the session but gate routes behind `mfa_verified_at`.
  4. Return `{ ok: true, mfa: true, email }`.
- `verifyLoginOtp(email, code)` → calls `verify-login-otp` edge function, then `supabase.auth.refreshSession()` so the new `app_metadata.mfa_verified_at` is reflected client-side.
- `resendLoginOtp(email)` → calls `send-login-otp` again.
- Add `loginWithGoogle()` post-flow: nothing changes at start (OAuth redirect), but on returning session we need to trigger OTP — see Section 5.
- Expose new derived flag `mfaVerified: boolean` from `user.app_metadata.mfa_verified_at` (any non-null value within current session).

## 5. Google OAuth post-login OTP

- In `AuthProvider`'s `onAuthStateChange`, when event is `SIGNED_IN` and `app_metadata.mfa_verified_at` is missing (or older than this session's `sign_in_at`), automatically call `send-login-otp` and stash email in `sessionStorage.login_email`, then navigate to `/login/verify`.
- Demo accounts bypass.

## 6. ProtectedRoute (`src/components/ProtectedRoute.tsx`)

- After existing `user` check, also check `mfaVerified` (and bypass for demo users).
- If not verified → `<Navigate to="/login/verify" replace />`.
- `/login/verify` itself must remain reachable while authenticated-but-unverified.

## 7. LoginVerify page (`src/pages/LoginVerify.tsx`)

- Same UI. Submit calls the new `verifyLoginOtp` (now backed by edge function).
- Resend calls `resendLoginOtp`; surface rate-limit errors from the edge function.
- On success navigate to `/engagements` (current behavior).

## 8. Types

- Generated Supabase types will pick up `login_otps` automatically after migration runs.
- No extra TS types needed beyond local zod schemas in the edge functions.

## 9. RLS / GRANTs summary

```text
login_otps:
  GRANT ALL ON public.login_otps TO service_role;
  ENABLE ROW LEVEL SECURITY;
  (no policies — clients cannot read/write directly)
```

## 10. Open items for you to confirm

1. **Resend API key** — I'll request `RESEND_API_KEY` via the secrets tool. OK?
2. **Sender address** — use `onboarding@resend.dev` for the prototype (only your Resend-owner inbox receives mail until a domain is verified), or do you already have a verified domain?
3. **Demo bypass** — keep `admin@kpmg.com` / `test_client@kpmg.com` skipping MFA entirely (current behavior)?

Reply and I'll switch to build mode.