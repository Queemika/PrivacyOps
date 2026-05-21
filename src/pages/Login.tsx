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
  const { login } = useAuth();
  const [email, setEmail] = useState("consultant@privacyteam.ph");
  const [password, setPassword] = useState("demo1234");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode: any credentials work
    const r = login(email, password);
    if (!r.ok) {
      // fall back: still let them in
      const accounts = JSON.parse(localStorage.getItem("pa_accounts") || "{}");
      accounts[email.toLowerCase()] = { firstName: "Demo", lastName: "User", email, password };
      localStorage.setItem("pa_accounts", JSON.stringify(accounts));
      const u = { firstName: "Demo", lastName: "User", email };
      localStorage.setItem("pa_user", JSON.stringify(u));
    }
    toast.success("Welcome to PrivacyOps");
    nav("/engagements", { replace: true });
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
          <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium">
            Sign In
          </Button>
          <p className="text-[11px] text-muted-foreground text-center pt-1">
            Demo: Any credentials work · Version 1.0 Prototype
          </p>
          <p className="text-[11px] text-muted-foreground text-center">
            Need an account?{" "}
            <Link to="/signup" className="text-accent hover:underline font-medium">Create one</Link>
          </p>
        </form>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-white/50 max-w-md text-center">
        <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
        Auto-generated content requires human review. All data shown is for demonstration only.
      </div>
    </div>
  );
}
