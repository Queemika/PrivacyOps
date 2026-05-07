import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@kpmg.com");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = login(email, password);
    if (!r.ok) { setError(r.error ?? "Login failed"); return; }
    toast.success("Welcome back");
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <div className="hidden lg:flex flex-col justify-between p-10 w-1/2 bg-[var(--gradient-primary)] text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-white/10 flex items-center justify-center font-bold">PA</div>
          <span className="font-semibold">PrivacyAtlas</span>
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">Enterprise Data Privacy Console</h1>
          <p className="text-sm text-primary-foreground/80">Automate PIAs, RoPA, NPC-RS and PRADAR — with anonymization, audit trail, and GDPR / Philippines compliance guidance built in.</p>
        </div>
        <p className="text-xs text-primary-foreground/60">Prototype · Sample data only · No real client data is processed.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sign in to PrivacyAtlas</span>
            </div>

            {forgot ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter your corporate email and we'll send a reset link.</p>
                <Input placeholder="firstname.lastname@kpmg.com" />
                <Button className="w-full" onClick={(e) => { e.preventDefault(); toast.success("Reset link sent (prototype)"); setForgot(false); }}>Send reset link</Button>
                <button type="button" className="text-xs text-accent hover:underline" onClick={() => setForgot(false)}>Back to sign in</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" autoComplete="email" placeholder="firstname.lastname@kpmg.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs text-accent hover:underline" onClick={() => setForgot(true)}>Forgot password?</button>
                  </div>
                  <Input id="password" type="password" autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2.5">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full">Sign in</Button>

                <p className="text-xs text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-accent hover:underline font-medium">Create one</Link>
                </p>
                <p className="text-[11px] text-muted-foreground text-center pt-2 border-t">
                  Only <span className="font-mono">@kpmg.com</span> corporate emails are accepted.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
