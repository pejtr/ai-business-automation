import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import AssistantWidget from "@/components/AssistantWidget";
import { cn } from "@/lib/utils";
import {
  Magnet, Mail, FileText, Zap, Heart,
  FolderOpen, LogOut, ChevronRight, Sparkles,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/* Each step gets its own neon color */
const NAV_ITEMS = [
  { path: "/attract",       label: "Attract",       icon: Magnet,   step: "01", description: "Lead Generation", color: "oklch(0.78 0.22 195)",  glow: "0 0 18px oklch(0.78 0.22 195 / 0.55)" },
  { path: "/convert",       label: "Convert",       icon: Mail,     step: "02", description: "Outreach Emails", color: "oklch(0.68 0.26 295)",  glow: "0 0 18px oklch(0.68 0.26 295 / 0.55)" },
  { path: "/deliver",       label: "Deliver",       icon: FileText, step: "03", description: "Brand Research",  color: "oklch(0.72 0.24 340)",  glow: "0 0 18px oklch(0.72 0.24 340 / 0.55)" },
  { path: "/automate",      label: "Automate",      icon: Zap,      step: "04", description: "Workflows",       color: "oklch(0.78 0.22 145)",  glow: "0 0 18px oklch(0.78 0.22 145 / 0.55)" },
  { path: "/human-element", label: "Human Element", icon: Heart,    step: "05", description: "Vision & Taste",  color: "oklch(0.82 0.18 75)",   glow: "0 0 18px oklch(0.82 0.18 75 / 0.55)" },
];

const SECONDARY_ITEMS = [
  { path: "/saved", label: "Saved Projects", icon: FolderOpen },
];

interface AppLayoutProps { children: ReactNode; }

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: () => toast.error("Logout failed"),
  });

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center dot-grid">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[oklch(0.78_0.22_195)] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[oklch(0.68_0.26_295/0.4)]" />
          </div>
          <p className="text-muted-foreground text-xs font-mono tracking-[0.2em] uppercase glow-cyan" style={{ color: "oklch(0.78 0.22 195)" }}>
            Initializing
          </p>
        </div>
      </div>
    );
  }

  /* ── Unauthenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center dot-grid relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: "oklch(0.78 0.22 195 / 0.06)" }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: "oklch(0.68 0.26 295 / 0.06)" }} />

        <div className="relative text-center space-y-7 max-w-sm px-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: "oklch(0.78 0.22 195 / 0.3)" }} />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.78 0.22 195 / 0.12)", border: "1px solid oklch(0.78 0.22 195 / 0.4)" }}>
              <Sparkles className="w-7 h-7" style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 8px oklch(0.78 0.22 195 / 0.8))" }} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Agency AI Platform</h2>
            <p className="text-muted-foreground text-sm">Sign in to access your AI-powered workflow</p>
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full font-semibold h-11"
            style={{ background: "linear-gradient(135deg, oklch(0.78 0.22 195), oklch(0.68 0.26 295))", color: "oklch(0.07 0.012 260)", boxShadow: "0 0 24px oklch(0.78 0.22 195 / 0.4)" }}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col h-screen sticky top-0 z-40 transition-all duration-300",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}
        style={{ background: "oklch(0.085 0.014 260)", borderRight: "1px solid oklch(0.18 0.02 260)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4" style={{ borderBottom: "1px solid oklch(0.18 0.02 260)" }}>
          <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, oklch(0.78 0.22 195 / 0.2), oklch(0.68 0.26 295 / 0.15))",
                border: "1px solid oklch(0.78 0.22 195 / 0.4)",
                boxShadow: "0 0 16px oklch(0.78 0.22 195 / 0.25)",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "oklch(0.78 0.22 195)", filter: "drop-shadow(0 0 6px oklch(0.78 0.22 195 / 0.9))" }} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight tracking-tight">Agency AI</p>
                <p className="text-[9px] font-mono tracking-[0.15em] uppercase" style={{ color: "oklch(0.78 0.22 195 / 0.6)" }}>Platform</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 transition-colors hover:text-foreground"
            style={{ color: "oklch(0.40 0.02 260)" }}
          >
            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", collapsed ? "" : "rotate-180")} />
          </button>
        </div>

        {/* Section label */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-1.5">
            <p className="text-[9px] font-mono tracking-[0.18em] uppercase" style={{ color: "oklch(0.38 0.02 260)" }}>Framework</p>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 px-2 py-1.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={active ? {
                    background: `${item.color.replace(")", " / 0.1)")}`,
                    border: `1px solid ${item.color.replace(")", " / 0.3)")}`,
                    boxShadow: `${item.glow}, inset 0 1px 0 ${item.color.replace(")", " / 0.1)")}`,
                  } : {
                    border: "1px solid transparent",
                  }}
                >
                  {/* Hover bg */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "oklch(0.15 0.02 260)" }} />
                  )}

                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <Icon
                      className="w-4 h-4 relative z-10 transition-all duration-200"
                      style={active ? { color: item.color, filter: `drop-shadow(0 0 6px ${item.color.replace(")", " / 0.9)")})` } : {}}
                    />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold truncate tracking-tight" style={active ? { color: item.color } : {}}>
                          {item.label}
                        </span>
                        <span
                          className="text-[8px] font-mono tracking-wider px-1 py-0.5 rounded"
                          style={active
                            ? { color: item.color, background: `${item.color.replace(")", " / 0.12)")}` }
                            : { color: "oklch(0.35 0.02 260)" }
                          }
                        >
                          {item.step}
                        </span>
                      </div>
                      <p className="text-[10px] truncate mt-0.5" style={{ color: active ? `${item.color.replace(")", " / 0.6)")}` : "oklch(0.38 0.02 260)" }}>
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Active left accent bar */}
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                    />
                  )}
                </div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-2 mx-1 neon-divider" />

          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={active ? {
                    background: "oklch(0.78 0.22 195 / 0.08)",
                    border: "1px solid oklch(0.78 0.22 195 / 0.25)",
                  } : { border: "1px solid transparent" }}
                >
                  {!active && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "oklch(0.15 0.02 260)" }} />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0 relative z-10" style={active ? { color: "oklch(0.78 0.22 195)" } : {}} />
                  {!collapsed && (
                    <span className="text-[13px] font-medium relative z-10 tracking-tight" style={active ? { color: "oklch(0.78 0.22 195)" } : {}}>
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-2" style={{ borderTop: "1px solid oklch(0.18 0.02 260)" }}>
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ background: "oklch(0.11 0.016 260)" }}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: "linear-gradient(135deg, oklch(0.78 0.22 195 / 0.2), oklch(0.68 0.26 295 / 0.15))", border: "1px solid oklch(0.78 0.22 195 / 0.3)", color: "oklch(0.78 0.22 195)" }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate leading-tight">{user?.name ?? "User"}</p>
                <p className="text-[10px] truncate" style={{ color: "oklch(0.40 0.02 260)" }}>{user?.email ?? ""}</p>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="transition-colors p-1 rounded-lg hover:bg-white/5"
                style={{ color: "oklch(0.40 0.02 260)" }}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logout.mutate()}
              className="w-full flex items-center justify-center py-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: "oklch(0.40 0.02 260)" }}
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

      {/* AI Assistant Widget */}
      <AssistantWidget />
    </div>
  );
}
