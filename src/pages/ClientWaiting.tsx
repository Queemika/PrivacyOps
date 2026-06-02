import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Mail, LogOut } from "lucide-react";
import { PrivacyOpsLogo } from "@/components/brand/PrivacyOpsLogo";

export default function ClientWaiting() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-lg p-8 text-center space-y-5">
        <div className="flex justify-center"><PrivacyOpsLogo variant="full" size="lg" /></div>
        <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <Clock className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Waiting for engagement access</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account ({user?.email}) is registered as a <b>Client</b>. An administrator
            will assign you to an engagement before you can access workspace modules.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 inline-flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" /> We'll notify you by email once you're added.
        </div>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={async () => { await logout(); nav("/login", { replace: true }); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
