# Phase A — Identity, Branding & Access Control

## 1. Branding (PrivacyOps logo)

Source: `privacyops_logo.html` + screenshots (need user to confirm both are uploaded — only screenshots referenced earlier).

- Create `src/components/brand/PrivacyOpsLogo.tsx` — SVG mark + wordmark, with `variant` prop: `mark`, `full`, `mono`. Sized via `className`.
- Replace the `ShieldCheck` square placeholder in:
  - `src/pages/Login.tsx`
  - `src/pages/Signup.tsx`
  - `src/components/AppSidebar.tsx` (header lockup)
  - Auth email scaffolding (later)
- Add the mark as the favicon: write `public/favicon.svg`, update `index.html` `<link rel="icon">` and `<title>` to "PrivacyOps".

## 2. Default admin account (admin@kpmg.com / admin123!)

The seeded admin already has the `Admin` role granted automatically via the `grant_admin_for_kpmg` function — but the auth user itself must exist.

- Add to the Login page a small "Use demo admin" helper button that prefills the form (visible only when fields are empty) so the team can sign in fast.
- One-time creation: instruct user to sign up admin@kpmg.com with password `admin123!` from the Signup page once. The trigger auto-grants Admin. (We cannot insert into `auth.users` directly from a migration without service role; the trigger handles role assignment on first signup.)
- Disable HIBP password check (`admin123!` is leaked) via `configure_auth` so the demo password is accepted.

## 3. MFA — email OTP on login

Plan: use **Supabase's native MFA with the `phone`/email factor is not available**; instead implement a custom **email OTP** flow on top of password login:

- After `signInWithPassword` succeeds, immediately `signOut`, generate a 6-digit code in an edge function `send-login-otp`, store hashed code + expiry (5 min) in a new `login_otps` table, email it via Lovable Auth email infra (requires email domain — fallback: log code to console + show toast in dev until domain configured).
- Add `/login/verify` route with 6-digit `InputOTP`. On success, edge function `verify-login-otp` issues a one-time magic link / re-authenticates the session.
- Alternative simpler path (recommended for prototype): use Supabase **`signInWithOtp`** as the second factor — after password verifies, send OTP to same email, user enters code, we call `verifyOtp({ type: 'email', token, email })` which returns a session. No custom tables needed.

I'll go with the **`signInWithOtp` + `verifyOtp`** approach. Requires `auto_confirm_email: true` to remain off; existing users will still get the OTP since `signInWithOtp` issues codes for known emails.

New migration: none required.
New table: none.

## 4. Role gating

Update `validateCorporateEmail` in `src/context/auth-context-base.ts`:
- Internal domain = `@kpmg.com` → eligible for Intern/Associate/Supervisor/Manager/Admin.
- Any other domain → allowed to sign up but auto-assigned `Client` role.

Add `Client` to the `app_role` enum via migration. Update `AppRole` type in `src/lib/roles/store.ts` and `ROLES` in `src/lib/admin/roleVisibility.ts`.

Add DB trigger `grant_client_for_external`: on new profile, if email domain ≠ `kpmg.com` AND no role assigned, insert `Client`.

## 5. Client lockdown

New route guard `ClientGate`:
- If user's only role is `Client` AND has no `engagement_members` row → redirect every protected route to `/engagements/waiting`.
- New page `src/pages/ClientWaiting.tsx`: friendly "Your admin hasn't assigned you to an engagement yet" screen with logout button.
- Sidebar hides all modules for Client-only users.
- Once admin assigns them to an engagement (existing `UserManagement` flow), they land on `/engagements` and can only see modules for engagements they're members of.

## 6. Files

**New**
- `src/components/brand/PrivacyOpsLogo.tsx`
- `src/components/ClientGate.tsx`
- `src/pages/LoginVerify.tsx`
- `src/pages/ClientWaiting.tsx`
- `public/favicon.svg`
- migration: add `Client` to enum + external-domain trigger

**Edited**
- `index.html` (title + favicon)
- `src/pages/Login.tsx` (logo, demo prefill, OTP step trigger)
- `src/pages/Signup.tsx` (logo, domain hint)
- `src/components/AppSidebar.tsx` (logo lockup, hide modules for Client)
- `src/components/AppLayout.tsx` (wrap with ClientGate)
- `src/context/AuthContext.tsx` (login → request OTP instead of session)
- `src/context/auth-context-base.ts` (validator + new `verifyLoginOtp` in ctx)
- `src/lib/roles/store.ts` (`Client` role)
- `src/lib/admin/roleVisibility.ts` (`Client` role with all modules hidden by default)
- `src/App.tsx` (`/login/verify`, `/engagements/waiting` routes)

## Open questions

1. **`privacyops_logo.html`** — I don't see it in the project. Can you paste its SVG markup or upload the file? Without it I'll generate a clean shield+wordmark inspired by the screenshots.
2. **MFA on every login or only first device?** Prototype default: every login.
3. **`admin123!` is a leaked password** — OK to disable HIBP so it works, or pick a stronger demo password?
