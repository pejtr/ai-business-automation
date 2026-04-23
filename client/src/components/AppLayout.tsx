import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  Magnet,
  Mail,
  FileText,
  Zap,
  Heart,
  FolderOpen,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { path: "/attract", label: "Attract", icon: Magnet, step: "01", description: "Lead Generation" },
  { path: "/convert", label: "Convert", icon: Mail, step: "02", description: "Outreach Emails" },
  { path: "/deliver", label: "Deliver", icon: FileText, step: "03", description: "Brand Research" },
  { path: "/automate", label: "Automate", icon: Zap, step: "04", description: "Workflows" },
  { path: "/human-element", label: "Human Element", icon: Heart, step: "05", description: "Vision & Taste" },
];

const SECONDARY_ITEMS = [
  { path: "/saved", label: "Saved Projects", icon: FolderOpen },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: () => toast.error("Logout failed"),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-mono tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-foreground mb-2">Sign in required</h2>
            <p className="text-muted-foreground text-sm">Access your AI workflow platform</p>
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-screen sticky top-0 border-r border-border transition-all duration-300 z-40",
          "bg-[oklch(0.11_0.006_260)]",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">Agency AI</p>
                <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Platform</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>

        {/* Framework label */}
        {!collapsed && (
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">Framework</p>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <div className="flex-shrink-0 relative">
                    <Icon className="w-4 h-4" />
                    {active && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{item.label}</span>
                        <span className={cn(
                          "text-[9px] font-mono tracking-wider px-1 py-0.5 rounded",
                          active ? "text-primary/70" : "text-muted-foreground/50"
                        )}>{item.step}</span>
                      </div>
                      <p className={cn(
                        "text-[11px] truncate",
                        active ? "text-primary/60" : "text-muted-foreground/50"
                      )}>{item.description}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 mx-2 h-px bg-border" />

          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user?.name ?? "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ""}</p>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logout.mutate()}
              className="w-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors py-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
