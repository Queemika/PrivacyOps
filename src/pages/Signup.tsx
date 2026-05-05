import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, validateCorporateEmail } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailErr = email ? validateCorporateEmail(email) : null;
  const emailOk = email && !emailErr;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = signup({ firstName: first, lastName: last, email, password });
    if (!r.ok) { setError(r.error ?? "Signup failed"); return; }
    toast.success("Account created");
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
          <h1 className="text-3xl font-semibold leading-tight">Create your enterprise account</h1>
          <p className="text-sm text-primary-foreground/80">Registration is restricted to authorised corporate email addresses.</p>
        </div>
        <p className="text-xs text-primary-foreground/60">Prototype · Sample data only.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Create your account</span>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fn">First name</Label>
                  <Input id="fn" value={first} onChange={(e) => setFirst(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ln">Last name</Label>
                  <Input id="ln" value={last} onChange={(e) => setLast(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="em">Work email</Label>
                <Input id="em" type="email" placeholder="firstname.lastname@kpmg.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className={emailErr ? "border-destructive focus-visible:ring-destructive" : ""} />
                {emailErr && (
                  <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{emailErr}</p>
                )}
                {emailOk && (
                  <p className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Corporate email accepted.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                <p className="text-[11px] text-muted-foreground">Minimum 8 characters.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2.5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!!emailErr || !email}>Create account</Button>

              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
              </p>
              <p className="text-[11px] text-muted-foreground text-center pt-2 border-t">
                Generic providers (gmail, yahoo, outlook…) are blocked. Only <span className="font-mono">@kpmg.com</span> is accepted.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
