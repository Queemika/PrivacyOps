import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { BackButton } from "./BackButton";
import Pixie from "./Pixie";
import { NotificationBell } from "./NotificationBell";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isEngagements = pathname === "/engagements";
  const showBack = pathname !== "/" && !isEngagements;

  // Engagement screen: no sidebar, clean canvas
  if (isEngagements) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="max-w-5xl mx-auto px-6 pt-4 flex items-center gap-3 justify-end">
          {user && <GlobalSearch className="mr-auto" />}
          {user && <NotificationBell />}
        </div>
        <main className="max-w-5xl mx-auto px-6 pb-12">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-4 right-6 z-20 flex items-center gap-2">
          {user && <GlobalSearch />}
          {user && <NotificationBell />}
        </div>
        {showBack && (
          <div className="absolute top-5 left-6 z-20">
            <BackButton />
          </div>
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
