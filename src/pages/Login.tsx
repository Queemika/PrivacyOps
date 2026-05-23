import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
    if (!r.ok) { toast.error(r.error || "Sign-in failed"); return; }
    toast.success("Welcome to PrivacyOps");
    nav("/engagements", { replace: true });
  };

  const google = async () => {
    setBusy(true);
    const r = await loginWithGoogle();
    setBusy(false);
    if (!r.ok) toast.error(r.error || "Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,hsl(220_45%_12%),hsl(220_50%_6%))] text-white p-6">
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center shadow-[0_10px_30px_-10px_hsl(var(--accent))]">
          <ShieldCheck className="h-7 w-7 text-accent-foreground" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">PrivacyOps</h1>
        <p className="text-sm text-white/60">Data Privacy Compliance Platform</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 text-foreground">
        <div className="text-xs text-muted-foreground mb-5">Sign in to your workspace</div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input id="email" type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <Input id="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={busy} className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium">
            {busy ? "Signing in…" : "Sign In"}
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white px-2 text-muted-foreground">or</span></div>
          </div>
          <Button type="button" variant="outline" onClick={google} disabled={busy} className="w-full h-11">
            Continue with Google
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Need an account?{" "}
            <Link to="/signup" className="text-accent hover:underline font-medium">Create one</Link>
          </p>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-white/50 max-w-md text-center">
        <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
        Auto-generated content requires human review.
      </div>
    </div>
  );
}
