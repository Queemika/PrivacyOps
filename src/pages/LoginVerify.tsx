import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { PrivacyOpsLogo } from "@/components/brand/PrivacyOpsLogo";
import { ArrowLeft, Mail } from "lucide-react";

export default function LoginVerify() {
  const nav = useNavigate();
  const { verifyLoginOtp, resendLoginOtp } = useAuth();

  const email = sessionStorage.getItem("login_email") || "";
  console.log("Verify page email:", email);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  if (!email) return <Navigate to="/login" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) return;

    setBusy(true);

    const r = await verifyLoginOtp(email, code);

    setBusy(false);

    if (!r.ok) {
      toast.error(r.error || "Invalid code");
      return;
    }

    sessionStorage.removeItem("login_email");

    toast.success("Welcome to PrivacyOps");
    nav("/engagements", { replace: true });
  };

  const resend = async () => {
    setBusy(true);
    const r = await resendLoginOtp(email);
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error || "Could not resend");
      return;
    }
    if (r.devCode) {
      toast.warning(`Dev code: ${r.devCode}`, { description: r.devNotice, duration: 30000 });
    } else {
      toast.success("New code sent");
    }
    setCooldown(30);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,hsl(220_45%_12%),hsl(220_50%_6%))] text-white p-6">
      <div className="flex flex-col items-center gap-2 mb-8">
        <PrivacyOpsLogo variant="mark" size="xl" />
        <div className="text-2xl font-semibold tracking-tight mt-2">
          Privacy<span className="text-accent">Ops</span>
        </div>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 text-foreground">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Mail className="h-3.5 w-3.5" /> Verification code sent to
        </div>
        <div className="font-medium text-sm mb-5">{email}</div>

        <form onSubmit={submit} className="space-y-5">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {busy ? "Verifying…" : "Verify & sign in"}
          </Button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => nav("/login")}
              className="text-muted-foreground hover:text-accent flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={busy || cooldown > 0}
              className="text-accent hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
