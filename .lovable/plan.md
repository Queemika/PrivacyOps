# Fix: preview redirects to /login on every navigation

## Root cause

`AuthProvider` initializes `user` to `null`, then reads `localStorage` inside a `useEffect`. On the first render (and on any hard refresh / preview reload), `ProtectedRoute` sees `user === null` and immediately redirects to `/login` — before the effect has had a chance to hydrate the saved session.

## Fix

1. **`src/context/AuthContext.tsx`**
   - Add a `ready` (or `loading`) flag to the context, initially `false`.
   - Read `pa_user` / `pa_audit` from `localStorage` synchronously during `useState` initialization (lazy initializer) instead of in `useEffect`, and set `ready = true`. Keep the admin-seed effect as-is.
   - Expose `ready` from `useAuth()`.

2. **`src/components/ProtectedRoute.tsx`**
   - While `!ready`, render a lightweight placeholder (e.g. `null` or a spinner) instead of redirecting.
   - Only `<Navigate to="/login" />` once `ready && !user`.

3. Sanity-check that no other component remounts `AuthProvider` (it should wrap the Router once in `App.tsx`).

## Result

Saved sessions hydrate before the first route match, so navigating between protected pages no longer bounces back to the login screen.