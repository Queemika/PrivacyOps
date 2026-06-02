import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { PrivacyOpsLogo } from "@/components/brand/PrivacyOpsLogo";

export default function Login() {
  const nav = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await login(email, password);
    setBusy(false);
    if (!r.ok) {
      toast.error(("error" in r && r.error) || "Sign-in failed");
      return;
    }
    if (r.mfa) {
      sessionStorage.setItem("login_email", r.email);
      if (r.devCode) {
        console.warn("[dev] Login OTP code:", r.devCode, r.devNotice);
        sessionStorage.setItem("login_dev_code", r.devCode);
        if (r.devNotice) sessionStorage.setItem("login_dev_notice", r.devNotice);
        toast.warning(`Dev code: ${r.devCode}`, {
          description: r.devNotice ?? "Resend rejected delivery — code shown for development only.",
          duration: 30000,
        });
      } else {
        sessionStorage.removeItem("login_dev_code");
        sessionStorage.removeItem("login_dev_notice");
      }
      nav("/login/verify", { replace: true });
      return;
    }
    nav("/engagements", { replace: true });
  };

  const google = async () => {
    setBusy(true);
    const r = await loginWithGoogle();
    setBusy(false);
    if (!r.ok) toast.error(r.error || "Google sign-in failed");
  };

  const fillDemo = () => {
    setEmail("admin@kpmg.com");
    setPassword("admin123!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,hsl(220_45%_12%),hsl(220_50%_6%))] text-white p-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <PrivacyOpsLogo variant="mark" size="xl" />
        <div className="text-2xl font-semibold tracking-tight mt-2">
          Privacy<span className="text-accent">Ops</span>
        </div>
        <p className="text-sm text-white/60">Data Privacy Compliance Platform</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 text-foreground">
        <div className="text-xs text-muted-foreground mb-5">Sign in to your workspace</div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium"
          >
            <KeyRound className="h-4 w-4 mr-2" />
            {busy ? "Sending code…" : "Continue"}
          </Button>

          <button
            type="button"
            onClick={fillDemo}
            className="w-full text-[11px] text-muted-foreground hover:text-accent text-center underline-offset-2 hover:underline"
          >
            Use demo admin (admin@kpmg.com)
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={google} disabled={busy} className="w-full h-11">
            Continue with Google
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Need an account?{" "}
            <Link to="/signup" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-white/50 max-w-md text-center">
        <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
        After your password we'll email a one-time code to verify it's you.
      </div>
    </div>
  );
}
