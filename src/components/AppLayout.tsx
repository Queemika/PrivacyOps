import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { ArrowLeft } from "lucide-react";
import Pixie from "./Pixie";

export default function AppLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const showBack = pathname !== "/" && pathname !== "/engagements";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {showBack && (
          <button
            onClick={() => nav(-1)}
            className="absolute top-5 left-6 z-20 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        <main className="flex-1 p-8 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
        <div className="text-center text-[11px] text-muted-foreground py-3 border-t bg-card/30">
          ⚠ Auto-generated content requires human review. All data shown is for demonstration only.
        </div>
        <Pixie />
      </div>
    </div>
  );
}
