import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, validateCorporateEmail } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const nav = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailErr = email ? validateCorporateEmail(email) : null;
  const emailOk = email && !emailErr;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    const r = await signup({ firstName: first, lastName: last, email, password });
    setBusy(false);
    if (!r.ok) { setError(r.error ?? "Signup failed"); return; }
    toast.success("Account created — check your email to confirm.");
    nav("/login", { replace: true });
  };

  const google = async () => {
    setBusy(true);
    const r = await loginWithGoogle();
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,hsl(220_45%_12%),hsl(220_50%_6%))] text-white p-6">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center shadow-[0_10px_30px_-10px_hsl(var(--accent))]">
          <ShieldCheck className="h-7 w-7 text-accent-foreground" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">PrivacyOps</h1>
        <p className="text-sm text-white/60">Create your workspace account</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 text-foreground">
        <div className="text-xs text-muted-foreground mb-5">Your admin will assign your role and engagements after sign-up.</div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fn" className="text-xs font-medium">First name</Label>
              <Input id="fn" value={first} onChange={(e) => setFirst(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ln" className="text-xs font-medium">Last name</Label>
              <Input id="ln" value={last} onChange={(e) => setLast(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="em" className="text-xs font-medium">Work email</Label>
            <Input id="em" type="email" placeholder="firstname.lastname@kpmg.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className={emailErr ? "border-destructive focus-visible:ring-destructive" : ""} />
            {emailErr && (
              <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{emailErr}</p>
            )}
            {emailOk && (
              <p className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Email accepted.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pw" className="text-xs font-medium">Password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <p className="text-[11px] text-muted-foreground">Minimum 8 characters.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={!!emailErr || !email || busy}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium">
            {busy ? "Creating…" : "Create account"}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white px-2 text-muted-foreground">or</span></div>
          </div>

          <Button type="button" variant="outline" onClick={google} disabled={busy} className="w-full h-11">
            Continue with Google
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-white/50 max-w-md text-center">
        <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
        Prototype · Sample data only.
      </div>
    </div>
  );
}
